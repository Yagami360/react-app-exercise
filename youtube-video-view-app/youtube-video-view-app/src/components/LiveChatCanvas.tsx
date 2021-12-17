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

// コンポーネントの引数
type probs = {
  liveChatId: string;
  liveBroadcastContent: string;
  chatCanvasMaxRow: number;
  getVideoCurrentTime: any;
  ref: RefObject<LiveChatCanvasHandler>;
  videoChatInfos: any;
}

// useImperativeHandle を使用する場合の定義方法
const LiveChatCanvas: RefForwardingComponent<LiveChatCanvasHandler, probs> = (probs, ref) => {
  console.log( "call LiveChatCanvas" )

  //------------------------
  // フック
  //------------------------
  // useImperativeHandle を使用することで、親関数コンポーネントから子関数コンポーネント（＝このコンポーネント）内の関数を呼び出せるようにする
  useImperativeHandle(ref, () => ({
    playTimeline,
    pauseTimeline,
    seekTimeline
  }));

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
    console.log( "[LiveChatCanvas] call useEffect1 (init)" )
    //console.log( "[LiveChatList in useEffect1] probs.liveChatId : ", probs.liveChatId )
    //console.log( "[LiveChatList in useEffect1] probs.liveBroadcastContent : ", probs.liveBroadcastContent )

    if ( probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming" ) {
      // canvas を設定
      setLiveChatCanvas()

      // 一定時間後に一度だけ canvas を設定
      //setTimeout(setLiveChatCanvas, 5000);

      // GSAP の TimeLine 作成
      createTimeLine()

      // タイムラインを再生
      playTimeline()
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
  }, [probs.liveBroadcastContent])


  // チャットデータ更新時に呼び出す副作用フック
  useEffect( () => {
    // GSAP の TimeLine を再作成
    createTimeLine()
  }, [probs.videoChatInfos])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // メソッド
  //------------------------
  // ライブチャット情報の Canvas タグの要素を設定するメソッド
  const setLiveChatCanvas = (): void => {
    console.log( "call setLiveChatCanvas" )
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
        if ( canvasContextRef.current !== null ) {
          canvasContextRef.current.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3'`;
          canvasContextRef.current.fillStyle = '#fff';
          //console.log( "canvasRef.current.width : ", canvasRef.current.width )
          //console.log( "canvasRef.current.height : ", canvasRef.current.height )
          //console.log( "canvasRef.current.clientWidth : ", canvasRef.current.clientWidth )
          //console.log( "canvasRef.current.clientHeight : ", canvasRef.current.clientHeight )
        }
      }
    }
  };

  // ライブチャット情報を Canvas にレンダリングするメソッド
  const renderLiveChatCanvas = (displayMessage: string, x:number, y:number) => {
    //console.log( "call renderLiveChatCanvas" )
    if ( canvasRef.current !== null && canvasContextRef.current !== null ) {
      // CanvasRenderingContext2D オブジェクトを用いて、長方形を描写
      canvasContextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      //canvasContextRef.current.clearRect(0, 0, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      canvasContextRef.current.fillText(displayMessage, x, y);     

    }

    // requestAnimationFrame() でこのメソッドを再帰的に呼び出すことで、ライブチャットのアニメーションを行う
    // requestAnimationFrame(関数名) : FPS が一定になるように、引数に渡した関数をブラウザの表示を邪魔しないタイミングで処理する関数
    //canvasFrameRef.current = window.requestAnimationFrame(renderLiveChatCanvas)
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
    if ( canvasRef.current !== null && canvasContextRef.current !== null && probs.videoChatInfos !== null ) {
      // TimeLine の内容をクリア
      if( timelineRef.current !== null ) {
        timelineRef.current.kill();
        timelineRef.current.clear();  
      }

      // チャット字幕のチャット位置
      // key : dict の key。publishedAt の文字列を key にする
      // count : 同じ時間に投稿されたチャット数
      // positions :  0 ~ chatCanvasMaxRow までのチャット位置の配列
      const chatPos: { [key: string]: { positions: number[]; count: number } } = {};
      //console.log( "chatPos : ", chatPos )
      //console.log( "[createTimeLine()] videoChatInfos : ", videoChatInfos )      
      probs.videoChatInfos.forEach((chat: any) => {
        // チャット字幕位置の初期化
        if (chatPos[chat["publishedAt"]] === undefined) {
          chatPos[chat["publishedAt"]] = { positions: getRandomChatPosition(), count: -1 };
        }
        else{

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

        //console.log('chat["displayMessage"] : ', chat["displayMessage"])
        //console.log('chatCss.x : ', chatCss.x)
        //console.log('chatCss.y : ', chatCss.y)

        // TimeLine.add() : TimeLine に各チャット字幕の Tween（小さな単位でのアニメーション）を追加
        timelineRef.current?.add(
          // Tween.to() : ゴールの状態を指定
          gsap.to(
            chatCss,    // アニメーションさせる CSS 要素
            // 完了状態を設定
            {
              x: -chatWidth,
              ease: "none",   // アニメーションの変化率（none : 線形変化）
              duration: 3,    // アニメーションの長さ
              // アニメーションが更新されるたびに呼び出されるコールバック関数
              onUpdate: () => {
                // canvas にレンダリング
                renderLiveChatCanvas(chat["displayMessage"], chatCss.x, chatCss.y)
              },
            },
          ),
          "+=1",      // 各 Tween の開始時間
        )
      })
      
      // タイムラインを動画の再生時間に同期
      //timelineRef.current?.seek(probs.getVideoCurrentTime());
    }
  }

  // TimeLine を再生
  const playTimeline = () => {
    console.log( "call playTimeline()" )
    //console.log( "[playTimeline] timelineRef.current : ", timelineRef.current )
    //seekTimeline(probs.getVideoCurrentTime());
    //seekTimeline(0);
    if( timelineRef.current !== null ) {
      //console.log( "[playTimeline] timelineRef.current.progress() : ", timelineRef.current.progress() )
      timelineRef.current.play();
    }
  };

  // TimeLine を一時停止
  const pauseTimeline = () => {
    if( timelineRef.current !== null ) {
      timelineRef.current.pause();
    }
  };

  // TimeLine の再生位置を指定した時間に設定
  const seekTimeline = (seconds: number) => {
    if( timelineRef.current !== null ) {
      timelineRef.current.seek(seconds);
    }
  };

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "[LiveChatCanvas] probs.liveBroadcastContent : ", probs.liveBroadcastContent )
  //console.log( "canvasRef: ", canvasRef )
  //console.log( "probs.videoChatInfos: ", probs.videoChatInfos )

  if ( (probs.liveBroadcastContent === "live" || probs.liveBroadcastContent === "upcoming") ) {
    // チャット字幕を HTML の canvas タグで表示する
    // position : "absolute" でチャット字幕の canvas を <iframe> 要素に重ねる
    // zIndex で重なり順序を指定。position: "absolute" と これを設定することで動画上に canvas を描写出来るようにする
    return (
      <Box style={{ position: "absolute", zIndex: 1, width: "100%", height: "100%"}}>
        { /* useRef() で作成した scrollShowMoreRef を <div> の ref 属性に設定することで DOM 属性を取得できる */ }
        <canvas ref={canvasRef}></canvas>
      </Box>
    )
  }
  else {
    return (
      <Box></Box>
    )
  }
}

// forwardRef() でコンポーネント内の DOM 要素に useRef() で作成した ref オブジェクトを親関数コンポーネントが渡すことが出来るようになる
export default forwardRef(LiveChatCanvas);
