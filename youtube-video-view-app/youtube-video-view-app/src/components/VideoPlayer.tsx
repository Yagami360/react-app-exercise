/* eslint-disable */
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import AppTheme from './Theme';
import YouTubeIframeAPI from '../youtube_api/YouTubeIframeAPI'

let player:any 

//===========================================
// YouTube 動画プレイヤーを表示するコンポーネント
//===========================================
// コンポーネントの引数
type Props = {
  videoId: any;
  autoPlay: boolean;
  videoWidth: string;
  videoHeight: string;  
  darkMode: boolean;
}

const VideoPlayer: React.FC<Props> = ({ 
  children,
  videoId,
  autoPlay,
  videoWidth, videoHeight,
  darkMode,
}) => {
  //------------------------
  // フック
  //------------------------
  const [videoURL, setVideoURL] = useState("")
  const [message, setMessage] = useState("loading chats")

  // ページ読み込み時の副作用フック
  useEffect( () => {
    if( videoId !== undefined && videoId !== "" ) {
      YouTubeIframeAPI.ready().then(() => {
        const autoPlayValue = (autoPlay === false ? 0 : 1);
        //console.log("autoPlayValue : ", autoPlayValue)

        // DOM の id 属性を iframe に置き換える
        player = new YT.Player(
          'player',     // この名前の HTML id 属性を iframe に置き換える
          {
            width: videoWidth,
            height: videoHeight,
            videoId: videoId,
            playerVars: {           // https://so-zou.jp/web-app/tech/web-api/google/youtube/player-api/#player-param
              autoplay: autoPlayValue,
              enablejsapi: 1,       // 1ならば、JavaScript APIが有効となる。
            },
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
            }
          }
        );
      });
    }
  }, [videoId, autoPlay])

  //------------------------
  // イベントハンドラ
  //------------------------
  // 動画読み込み時のイベントハンドラ
  const onPlayerReady = () => {
  };

  // Youtube Player のステート変更時のイベントハンドラ
  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
  };

  // もっと見るボタンクリック時のイベントハンドラ
  const onClickScreenShort = ((event: any) => {
    console.log( "call onClickScreenShort" )

    // 動画 URL から動画をダウンロード

    // 動画の現在の再生時間を取得する
    const currentTime = player.getCurrentTime();
    console.log( "currentTime : ", currentTime )

    // 動画から現在の再生時間の画像を取得する

  })

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "[VideoPlayer] videoURL : ", videoURL )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      <Typography>{message}</Typography> 
      <Box style={{display: "block"}}>
        { /* 動画表示。id="player" の部分が iframe に置き換わる */ }
        <div id="player"></div> 
        { /* コントロールパネル */ }
        <Box mx={1} style={{textAlign: "right"}}>
          <Button variant="text" onClick={onClickScreenShort}><Typography variant="subtitle2">スクショ</Typography></Button>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default VideoPlayer;
