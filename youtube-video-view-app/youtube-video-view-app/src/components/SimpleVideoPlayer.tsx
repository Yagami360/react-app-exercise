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

const SimpleVideoPlayer: React.FC<Props> = ({ 
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
      if( autoPlay ){
        setVideoURL('https://www.youtube.com/embed/' + videoId + '?autoplay=1')
      }
      else {
        setVideoURL('https://www.youtube.com/embed/' + videoId)        
      }
      setMessage("")
    }
    else {
      setMessage("動画IDが設定されていません")
    }
  }, [videoId, autoPlay])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "[VideoPlayer] videoURL : ", videoURL )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      <Typography>{message}</Typography> 
      <Box style={{display: "block"}}>
        { /* 動画表示 */ }
        { /* IFrame Player API では、<iframe> タグで動画プレイヤーを埋め込むことで動画再生できるようになる。<iframe> は、HTML の標準機能でインラインフレーム要素を表す */ }
        <iframe id="ytplayer" data-type="text/html" width={videoWidth} height={videoHeight} src={videoURL} frameBorder="0"></iframe>
      </Box>
    </ThemeProvider>
  )
}

export default SimpleVideoPlayer;
