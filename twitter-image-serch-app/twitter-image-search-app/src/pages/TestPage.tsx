import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useTheme, ThemeProvider} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles'

import firebase from "firebase";
import '../firebase/initFirebase'

import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TwitterCard from '../components/TwitterCard'

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
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
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
  return (
    <ThemeProvider theme={theme}>
      {/* ヘッダー表示 */}
      <Header title="Twitter Image Search App" selectedTabIdx={3} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}></Header>
      {/* ボディ表示 */}
      <Typography variant="subtitle1">{message}</Typography>
      {/* レイアウト確認用 */}
      <Box className={style.horizontalScroll}>
        <Box className={style.horizontalScrollColums}>
          <Box className={style.horizontalScrollRaws}>Box1</Box>
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
        <div className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></div>
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
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"} /></Box>
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box> 
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>                   
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>                   
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>                   
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box> 
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
        <Box className={style.horizontalScrollColums}><TwitterCard userId={"0"} userName={"ユーザー１"} userScreenName={"user1"} profileImageUrl={""} tweetTime={""} tweetId={""} imageFileUrl={""} imageHeight="250px" imageWidth="1000px" contentsText={"tweet text1"} /></Box>
      </Box>
    </ThemeProvider>
*/