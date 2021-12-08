import React from 'react';
import { useState, useEffect } from 'react'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import firebase from "firebase";
import '../firebase/initFirebase'

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import AppConfig, { FollowPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import { getAPIKey, getChannelInfo, getVideoInfo } from '../youtube_api/YouTubeDataAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//=======================================
// お気に入りページを表示するコンポーネント
//=======================================
const FollowPage: React.VFC = () => {
  //------------------------
  // スタイル定義
  //------------------------

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)
  const [message, setMessage] = useState('loading pages..')

  // ページ読み込み時の副作用フック
  useEffect(() => {
    if( auth.currentUser !== null ) {
      // フォロー済みユーザーを取得
      firestore.collection(FollowPageConfig.collectionNameFollow).doc(auth.currentUser.email).collection(FollowPageConfig.collectionNameFollow).get().then( (snapshot)=> {
        snapshot.forEach((document)=> {
          // document.data() : ドキュメント内のフィールド
          const field = document.data()
          console.log( "field : ", field )
        })
      })
    }
    else {
      setMessage("Please login")
    }
  }, [])

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log("favListJsx : ", favListJsx )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.followPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="h6">{message}</Typography>
      <Box m={2}>

      </Box>
    </ThemeProvider>
  )
}

export default FollowPage;

