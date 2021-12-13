/* eslint-disable */
// React
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef, useImperativeHandle, forwardRef, RefForwardingComponent, RefObject } from 'react'
import { useParams, useLocation } from 'react-router-dom';

// Material-UI
import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar'
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Paper from '@material-ui/core/Paper';

// アニメーション用
import { gsap } from 'gsap';

// Firebase
import firebase from "firebase";
import '../firebase/initFirebase'

// 自作モジュール
import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import { getAPIKey, getVideoChatInfos } from '../youtube_api/YouTubeDataAPI';

//=======================================================
// ライブ動画のチャットをニコニコ風字幕で表示するコンポーネント
//=======================================================
// 外部公開したいメソッドの定義。useImperativeHandle() を使用して親コンポーネントから子コンポーネントで定義したメソッドを呼び出すために定義
export interface LiveChatCanvasHandler {
  playTimeline: () => void;
  pauseTimeline: () => void;
  seekTimeline: (seconds: number) => void;
}

// グローバル変数
let chatNextPageToken: any = ""
let chats_: any[] = []

// 独自スタイル
const useStyles = makeStyles({
  chatCanvasStyle: {
    height: "780px",
    overflowY: "scroll",      // 縦スクロールバー
  },
})

// コンポーネントの引数
type probs = {
  liveChatId: string;
  liveBroadcastContent: string;
  chatCanvasMaxRow: number;
  getVideoCurrentTime: any;
  ref: RefObject<LiveChatCanvasHandler>;
}

// useImperativeHandle を使用する場合の定義方法
const LiveChatCanvas: RefForwardingComponent<LiveChatCanvasHandler, probs> = (probs, ref) => {
  console.log( "call LiveChatCanvas" )

  //------------------------
  // フック
  //------------------------
  //
  useImperativeHandle(ref, () => ({
    playTimeline,
    pauseTimeline,
    seekTimeline
  }));

  // 独自スタイル
  const style = useStyles()

  // チャット情報
  const [videoChatInfos, setVideoChatInfos] = useState([] as any)
  const [message, setMessage] = useState("loading chats")

  // canvas 情報
  const canvasRef = React.useRef<HTMLCanvasElement>(null);                                // DOM の canvas タグへの参照
  const canvasContextRef = React.useRef<CanvasRenderingContext2D | null>(null);           // DOM の Canvas 要素に描画するための CanvasRenderingContext2D オブジェクト。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意
  const canvasHeight = React.useRef<number>(0);                                           // チャット字幕の1行分の高さ。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意
  const canvasFrameRef = React.useRef<number>(0);                                         // requestAnimationFrame の戻り値。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意

  // アニメーション
  const timelineRef = React.useRef<any>(gsap.timeline({                                   // GSAP で連続アニメーションするための TimeLine オブジェクト。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意
    paused: true,   // 勝手にアニメーションが始まらないように設定
  }));                      

  // ページ読み込み時の副作用フック
  useEffect( () => {
    //console.log( "call useEffect1 (init)" )
    //console.log( "[LiveChatList in useEffect1] probs.liveChatId : ", probs.liveChatId )
    //console.log( "[LiveChatList in useEffect1] probs.liveBroadcastContent : ", probs.liveBroadcastContent )

    // 非同期処理実行
    if ( probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming" ) {
      // ライブチャット情報を取得する
      getLiveChatAsync()

      // canvas を更新
      updateLiveChatCanvas()

      // 一定時間後に一度だけ canvas を更新
      setTimeout(updateLiveChatCanvas, 500);

      // canvas にレンダリング
      renderLiveChatCanvas()
    }

    // アンマウント時の処理
    return () => {
      // requestAnimationFrame() で設定した更新処理を停止。requestAnimationFrame の戻り値を設定することで停止できる
      if( canvasFrameRef.current !== null ) {
        cancelAnimationFrame(canvasFrameRef.current);
      }

      // TimeLine 削除
      if( timelineRef.current !== null ) {
        timelineRef.current.kill();
        timelineRef.current.clear();  
      }
    };

  }, [probs.liveChatId, probs.liveBroadcastContent])

  // setInterval() を呼び出す副作用フック。レンダーの度にsetIntervalが何度も実行されて、オーバーフローやメモリリークが発生するので副作用フック内で行う
  useEffect( () => {
    console.log( "call useEffect2 (setInterval)" )

    // 一定時間経過度に呼び出されるイベントハンドラ
    // setInterval(()=>{処理}, インターバル時間msec) : 一定時間度に {} で定義した処理を行う
    if ( probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming" ) {
      let timerChat = setInterval( ()=>{
        console.log( "call timerChat" )
        //console.log( "[LiveChatList in useEffect2] probs.liveChatId : ", probs.liveChatId )
        //console.log( "[LiveChatList in useEffect2] probs.liveBroadcastContent : ", probs.liveBroadcastContent )
  
        // ライブチャット情報を取得
        if ( probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming" ) {
          //console.log( "[LiveChatList in useEffect2] chatNextPageToken : ", chatNextPageToken )
          getVideoChatInfos(getAPIKey(), probs.liveChatId, VideoWatchPageConfig.maxResultsIntervalChat, 1, chatNextPageToken )
            .then( ([videoChatInfos_, chatNumber_, nextPageToken_ ]) => {
              //console.log( "[timerChat] videoChatInfos_ : ", videoChatInfos_ )     
              chatNextPageToken = nextPageToken_

              videoChatInfos_.forEach((videoChatInfo_: any)=> {
                setVideoChatInfos([...videoChatInfos, videoChatInfo_])
              })
              //setVideoChatInfos([...videoChatInfos, videoChatInfos_])
            })
            .catch(err => {
              console.log(err);
            })    
            .finally( () => {
            })
        }
      }, VideoWatchPageConfig.intervalTimeChat );
  
      // アンマウント処理
      return () => {
        clearInterval(timerChat)
        console.log('コンポーネントがアンマウントしました')
      }
    }
  }, [probs.liveChatId, probs.liveBroadcastContent])

  // チャットデータ更新時に呼び出す副作用フック
  useEffect( () => {
    // GSAP の TimeLine 作成
    createTimeLine()

    // タイムラインを再生
    playTimeline()
  }, [videoChatInfos])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // メソッド
  //------------------------
  // ライブチャット情報を取得する非同期関数
  const getLiveChatAsync = async () => {
    // ライブチャット情報を取得
    if ( probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming" ) {
      let videoChatInfos_ = null
      let chatNumber_ = null
      try {
        [videoChatInfos_, chatNumber_, chatNextPageToken] = await getVideoChatInfos(getAPIKey(), probs.liveChatId, VideoWatchPageConfig.maxResultsChat, VideoWatchPageConfig.iterChat, chatNextPageToken)
        //console.log( "videoChatInfos_ : ", videoChatInfos_ )    
        //console.log( "chatNextPageToken : ", chatNextPageToken )
      }
      catch (err) {
        console.error(err);
        setMessage("チャットの取得に失敗しました")
      }

      setVideoChatInfos(videoChatInfos_)
      setMessage("")
    }
  }

  // ライブチャット情報の Canvas を更新するメソッド
  const updateLiveChatCanvas = (): void => {
    console.log( "call updateLiveChatCanvas" )
    if (canvasRef.current !== null) {
      // 親
      const parent = canvasRef.current.parentNode as HTMLElement;
      if (parent !== null) {
        // canvas サイズを設定
        canvasRef.current.width = parent.offsetWidth;
        canvasRef.current.height = parent.offsetHeight;
    
        // チャット字幕の1行分の高さを計算
        canvasHeight.current = canvasRef.current.height / probs.chatCanvasMaxRow;

        // canvas タグの line-height 属性の値
        const canvasLineHeight = getCanvasLineHeight();

        // 画面にコメントが10行収まるフォントサイズ
        const fontSize = canvasHeight.current * canvasLineHeight;

        // canvas タグの context 属性を作成し、CanvasRenderingContext2D オブジェクトに設定
        canvasContextRef.current = canvasRef.current.getContext('2d');

        // context 属性のフォントを設定
        if (canvasContextRef.current !== null) {
          canvasContextRef.current.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3'`;
          canvasContextRef.current.fillStyle = '#fff';
        }
      }
    }
  };

  // ライブチャット情報を Canvas にレンダリングするメソッド
  const renderLiveChatCanvas = () => {
    console.log( "call renderLiveChatCanvas" )

    if ( canvasRef.current !== null && canvasContextRef.current !== null ) {
      // CanvasRenderingContext2D オブジェクトを用いて、長方形を描写
      canvasContextRef.current.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }

    // requestAnimationFrame() でこのメソッドを再帰的に呼び出すことで、ライブチャットのアニメーションを行う
    // requestAnimationFrame(関数名) : FPS が一定になるように、引数に渡した関数をブラウザの表示を邪魔しないタイミングで処理する関数
    canvasFrameRef.current = window.requestAnimationFrame(renderLiveChatCanvas)
  }

  // canvas タグの fillText で設定されている line-height 属性の値の返すメソッド
  const getCanvasLineHeight = () => {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
  
    if (context === null) return 0;
  
    canvas.width = canvas.height = 200;
    context.font = `normal 100px Meiryo, メイリオ`;
    context.fillText('A', 0, 100);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let textHeight = 0;
    let currentRow = -1;
    for (let index = 0, length = data.length; index < length; index += 4) {
      if (data[index + 3] > 0) {
        const row = Math.floor(index / 4 / canvas.width);
        if (row > currentRow) {
          currentRow = row;
          textHeight += 1;
        }
      }
    }
  
    return 100 / textHeight;
  };

  const getRandomChatPosition = (): number[] => {
    const positions = [];

    // コメントの 1 ~chatCanvasMaxRow 行目までの位置
    for (let index = 1; index <= probs.chatCanvasMaxRow; index++) {
      positions.push(canvasHeight.current * index);
    }

    // 配列シャッフル
    for (let index = positions.length - 1; index >= 0; index--) {
      const rand = Math.floor(Math.random() * (index + 1));
      [positions[index], positions[rand]] = [positions[rand], positions[index]];
    }

    return positions;
  };

  // GSAP で連続アニメーションを行うための TimeLine 作成
  const createTimeLine = () => {
    console.log( "call createTimeLine()" )
    console.log( "[createTimeLine()] videoChatInfos : ", videoChatInfos )
    if ( canvasRef.current !== null && canvasContextRef.current !== null && videoChatInfos !== null ) {
      // TimeLine 削除
      if( timelineRef.current !== null ) {
        timelineRef.current.kill();
        timelineRef.current.clear();  
      }

      // チャット字幕のチャット位置
      // key : dict の key。publishedAt の文字列を key にする
      // count : 同じ時間に投稿されたチャット数
      // positions :  0 ~ chatCanvasMaxRow までのチャット位置の配列
      const chatPos: { [key: string]: { positions: number[]; count: number } } = {};
      console.log( "chatPos : ", chatPos )

      videoChatInfos.forEach((chat: any) => {
        // チャット字幕位置の初期化
        if (chatPos[chat["publishedAt"]] === undefined) {
          chatPos[chat["publishedAt"]] = { positions: getRandomChatPosition(), count: -1 };
        }

        // チャットの publishedAt を key にすることで、同じ時間に投稿されたチャット数を計算できる
        chatPos[chat["publishedAt"]].count += 1

        // チャット字幕の y 座標位置を計算
        let chatY: number = 0
        if(chatPos[chat["publishedAt"]].count >= probs.chatCanvasMaxRow) {
          // 同じ時間に投稿されたチャット数が chatMaxRow を超えた場合はランダムな位置に設定
          chatY = chatPos[chat["publishedAt"]].positions[Math.floor(Math.random() * (probs.chatCanvasMaxRow-1))]
        }
        else {
          // count 数
          chatY = chatPos[chat["publishedAt"]].positions[chatPos[chat["publishedAt"]].count]
        }

        // チャット幅を計算 
        const chatWidth: any = canvasContextRef.current?.measureText(chat).width
        //console.log( "chatWidth : ", chatWidth )

        // アニメーションさせる CSS 要素
        const chatCss: any = {
          x: canvasRef.current?.width,
          y: chatY,
        };

        // TimeLine.add() : TimeLine に各チャット字幕の Tween（小さな単位でのアニメーション）を追加
        timelineRef.current.add(
          // Tween.to() : ゴールの状態を指定
          gsap.to(
            chatCss,    // アニメーションさせる CSS 要素
            3,          // アニメーションが開始するまでの時間(秒単位)
            // 完了状態を設定
            {
              x: -chatWidth,
              ease: "none",   // アニメーションの変化率（none : 線形変化）
              // アニメーションが更新されるたびに呼び出されるコールバック関数
              onUpdate: () => {
                // canvas タグの context 属性にチャットのテキストを設定
                canvasContextRef.current?.fillText(videoChatInfos["displayMessage"], chatCss.x, chatCss.y);            
              },
            },
          ),
          "+=1",      // 各 Tween の開始時間
        )
      })
      
      // タイムラインを動画の再生時間に同期
      timelineRef.current.seek(probs.getVideoCurrentTime());
    }
  }

  // TimeLine を再生
  const playTimeline = () => {
    seekTimeline(probs.getVideoCurrentTime());
    timelineRef.current.play();
  };

  // TimeLine を一時停止
  const pauseTimeline = () => {
    timelineRef.current.pause();
  };

  // TimeLine の再生位置を指定した時間に設定
  const seekTimeline = (seconds: number) => {
    timelineRef.current.seek(seconds);
  };

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "videoChatInfos: ", videoChatInfos )
  if ( probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming" ) {
    // チャット字幕を HTML の canvas タグで表示する
    return (
      <canvas className="live-chat-canvas" ref={canvasRef}></canvas>
    )
  }
  else {
    return (
      <div></div>
    )
  }
}

export default LiveChatCanvas;
