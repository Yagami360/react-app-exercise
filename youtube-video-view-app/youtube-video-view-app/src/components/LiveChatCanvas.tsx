/* eslint-disable */
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom';

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

import firebase from "firebase";
import '../firebase/initFirebase'

import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import { getAPIKey, getVideoChatInfos } from '../youtube_api/YouTubeDataAPI';

//=======================================================
// ライブ動画のチャットをニコニコ風字幕で表示するコンポーネント
//=======================================================
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
type Props = {
  liveChatId: string;
  liveBroadcastContent: string;
  chatCanvasMaxRow: number;
}

const LiveChatCanvas: React.FC<Props> = ({ 
  children,
  liveChatId,
  liveBroadcastContent,
  chatCanvasMaxRow = 20,          // チャット字幕の最大表示行の数
}) => {
  console.log( "call LiveChatList" )
  //console.log( "[LiveChatList] liveChatId : ", liveChatId )
  //console.log( "[LiveChatList] liveBroadcastContent : ", liveBroadcastContent )

  //------------------------
  // フック
  //------------------------
  // 独自スタイル
  const style = useStyles()

  // チャット情報
  const [chats, setChats] = useState([] as any)
  const [message, setMessage] = useState("loading chats")

  // canvas 情報
  const canvasRef = React.useRef<HTMLCanvasElement>(null);                          // DOM の canvas タグへの参照
  const canvasContextRef = React.useRef<CanvasRenderingContext2D | null>(null);     // DOM の Canvas 要素に描画するための CanvasRenderingContext2D オブジェクト。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意
  const canvasHeight = React.useRef<number>(0);                                     // チャット字幕の1行分の高さ。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意
  const canvasFrameRef = React.useRef<number>(0);                                   // requestAnimationFrame の戻り値。useRef で定義することで、値が更新されても表示が更新されないようにする。DOM 要素への参照としては使っていないことに注意

  // ページ読み込み時の副作用フック
  useEffect( () => {
    //console.log( "call useEffect1 (init)" )
    //console.log( "[LiveChatList in useEffect1] liveChatId : ", liveChatId )
    //console.log( "[LiveChatList in useEffect1] liveBroadcastContent : ", liveBroadcastContent )

    // 非同期処理実行
    if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
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
      if( canvasFrameRef.current !== none ) {
        // requestAnimationFrame() で設定した更新処理を停止。requestAnimationFrame の戻り値を設定することで停止できる
        cancelAnimationFrame(canvasFrameRef.current);
      }
    };

  }, [liveChatId, liveBroadcastContent])

  // setInterval() を呼び出す副作用フック。レンダーの度にsetIntervalが何度も実行されて、オーバーフローやメモリリークが発生するので副作用フック内で行う
  useEffect( () => {
    console.log( "call useEffect2 (setInterval)" )

    // 一定時間経過度に呼び出されるイベントハンドラ
    // setInterval(()=>{処理}, インターバル時間msec) : 一定時間度に {} で定義した処理を行う
    if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
      let timerChat = setInterval( ()=>{
        console.log( "call timerChat" )
        //console.log( "[LiveChatList in useEffect2] liveChatId : ", liveChatId )
        //console.log( "[LiveChatList in useEffect2] liveBroadcastContent : ", liveBroadcastContent )
  
        // ライブチャット情報を取得
        if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
          //console.log( "[LiveChatList in useEffect2] chatNextPageToken : ", chatNextPageToken )
          getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsIntervalChat, 1, chatNextPageToken )
            .then( ([videoChatInfos_, chatNumber_, nextPageToken_ ]) => {
              //console.log( "[timerChat] videoChatInfos_ : ", videoChatInfos_ )     
              chatNextPageToken = nextPageToken_

              videoChatInfos_.forEach((videoChatInfo_: any)=> {
                chats_.unshift(videoChatInfo_["displayMessage"])
                setChats([...chats_, videoChatInfo_["displayMessage"]])
              })
              //setChats(chats_)
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
  }, [liveChatId, liveBroadcastContent])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // メソッド
  //------------------------
  // ライブチャット情報を取得する非同期関数
  const getLiveChatAsync = async () => {
    // ライブチャット情報を取得
    if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
      let videoChatInfos_ = undefined
      let chatNumber_ = undefined
      try {
        [videoChatInfos_, chatNumber_, chatNextPageToken] = await getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsChat, VideoWatchPageConfig.iterChat, chatNextPageToken)
        console.log( "videoChatInfos_ : ", videoChatInfos_ )    
        console.log( "chatNextPageToken : ", chatNextPageToken )
      }
      catch (err) {
        console.error(err);
        setMessage("チャットの取得に失敗しました")
      }

      videoChatInfos_.forEach((videoChatInfo_: any)=> {
        chats_.unshift(videoChatInfo_["displayMessage"])
        //setChats([...chats_, videoChatInfo_["displayMessage"]])
      })

      setChats(chats_)
      setMessage("")
    }
  }

  // ライブチャット情報の Canvas を更新するメソッド
  const updateLiveChatCanvas = (): void => {
    if (canvasRef.current !== null) {
      // 親
      const parent = canvasRef.current.parentNode as HTMLElement;
      if (parent !== null) {
        // canvas サイズを設定
        canvasRef.current.width = parent.offsetWidth;
        canvasRef.current.height = parent.offsetHeight;
    
        // チャット字幕の1行分の高さを計算
        canvasHeight.current = canvasRef.current.height / chatCanvasMaxRow;

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

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "chats: ", chats )
  if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
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
