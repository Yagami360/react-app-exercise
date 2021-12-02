import React from 'react';
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import '../firebase/initFirebase'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from '@material-ui/lab/Autocomplete';

import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// 動画視聴ページを表示するコンポーネント
const VideoWatchPage: React.VFC = () => {
  //------------------------
  // パスパラメーター
  //------------------------
  const location = useLocation();   // URL path や パラメータなど
  const params = useParams();       // パスパラメーター取得
  const videoId = params["video_id"]
  const videoURL = 'https://www.youtube.com/embed/' + videoId;
  console.log( "videoURL : ", videoURL )
  console.log( "location : ", location )
  console.log( "params : ", params )
  console.log( "videoId : ", videoId )
  console.log( "videoURL : ", videoURL )

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)
  
  //------------------------
  // イベントハンドラ
  //------------------------  

  //------------------------
  // JSX での表示処理
  //------------------------

  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.videoWatchPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* ボディ入力 */}
      <Box m={2}>
        { /* IFrame Player API では、<iframe> タグで動画プレイヤーを埋め込むことで動画再生できるようになる。<iframe> は、HTML の標準機能でインラインフレーム要素を表す */ }
        <iframe id="ytplayer" data-type="text/html" width={VideoWatchPageConfig.videoWidth} height={VideoWatchPageConfig.videoHeight} src={videoURL} frameBorder="0"></iframe>
      </Box>
    </ThemeProvider>
  );
}

export default VideoWatchPage;
