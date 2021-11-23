import React from 'react';
import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useTheme, createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles'

import firebase from "firebase";
import '../firebase/initFirebase'

import AppRoutes from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TweetCard from '../components/TweetCard'

// スタイル定義
const useStyles = makeStyles({
  horizontalScroll: {
    overflowX: "scroll",
    whiteSpace: "nowrap",
    //display: "flex",
  },
  horizontalScrollColums: {
    display: "inline-block",
    //display: "flex",
    margin: "4px",
    width: "300px",
    verticalAlign: "top",
  },
  horizontalScrollRaws: {
    //display: "flex",
    margin: "4px",
    width: "100%",
    whiteSpace: "normal",
  }
})

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// お気に入りページを表示するコンポーネント
const TestPage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist("twitter-image-search-app", "darkMode", false)

  // テーマ（画面全体のスタイル）の設定
  const lightTheme = createMuiTheme({
    palette: {
      type: "light",
    },
  });
  const darkTheme = createMuiTheme({
    palette: {
      type: "dark",
    },
  });
  /*
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
        },
      }),
    [darkMode],
  );
      */

  // 独自スタイル
  const style = useStyles()

  // メッセージ
  const [message, setMessage] = useState('Test Page')

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log("darkMode : ", darkMode)
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.testPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="subtitle1">{message}</Typography>
      {/* レイアウト確認用 */}
      <Box className={style.horizontalScroll}>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
          <Box className={style.horizontalScrollRaws}>Box1-1</Box>
          <Box className={style.horizontalScrollRaws}>Box1-2</Box>
          <Box className={style.horizontalScrollRaws}>Box1-3</Box>
          <Box className={style.horizontalScrollRaws}>Box1-4</Box>
          <Box className={style.horizontalScrollRaws}>Box1-5</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box2</Box>
          <Box className={style.horizontalScrollRaws}>Box2-1</Box>
          <Box className={style.horizontalScrollRaws}>Box2-2</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box3</Box>
          <Box className={style.horizontalScrollRaws}>Box3-1</Box>
          <Box className={style.horizontalScrollRaws}>Box3-2</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box4</Box>
          <Box className={style.horizontalScrollRaws}>Box4-1</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box5</Box>
          <Box className={style.horizontalScrollRaws}>Box5-1</Box>
          <Box className={style.horizontalScrollRaws}>Box5-2</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box6</Box>
          <Box className={style.horizontalScrollRaws}>Box6-1</Box>
          <Box className={style.horizontalScrollRaws}>Box6-2</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box7</Box>
          <Box className={style.horizontalScrollRaws}>Box7-1</Box>
          <Box className={style.horizontalScrollRaws}>Box7-2</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box8</Box>
          <Box className={style.horizontalScrollRaws}>Box8-1</Box>
          <Box className={style.horizontalScrollRaws}>Box8-2</Box>
        </Box>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box9</Box>
          <Box className={style.horizontalScrollRaws}>Box9-1</Box>
          <Box className={style.horizontalScrollRaws}>Box9-2</Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default TestPage;

/*
      <div className={style.horizontalScroll}>
        <div className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></div>
        <div className={style.horizontalScrollColums}>div2</div>
        <div className={style.horizontalScrollColums}>div3</div>
        <div className={style.horizontalScrollColums}>div4</div>
        <div className={style.horizontalScrollColums}>div5</div>
        <div className={style.horizontalScrollColums}>div6</div>
        <div className={style.horizontalScrollColums}>div7</div>
        <div className={style.horizontalScrollColums}>div8</div>
        <div className={style.horizontalScrollColums}>div9</div>
        <div className={style.horizontalScrollColums}>div10</div>
      </div>

*/

/*
      <Box className={style.horizontalScroll}>
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"} /></Box>
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box> 
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>                   
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>                   
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>                   
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box> 
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
        <Box className={style.horizontalScrollColums}><TweetCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
      </Box>
    </ThemeProvider>
*/