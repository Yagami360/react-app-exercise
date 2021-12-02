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

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import AppConfig from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'

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
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

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
  const onDragEndTweetCard = ((result: any) => {
    console.log('Drag ended');
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    console.log('result.source.index : ', result.source.index);
    console.log('result.destination.index : ', result.destination.index);

    //const cardListJsx_ = Array.from(cardListJsx);   // ステートの配列 favListJsx を deep copy して、コピーした配列で操作
    //const [reorderedCardListJsx] = cardListJsx_.splice(result.source.index, 1);
    //cardListJsx_.splice(result.destination.index, 0, reorderedCardListJsx);
    //setCardListJsx(cardListJsx_)
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log("darkMode : ", darkMode)
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}
      <Header title="Video View App" selectedTabIdx={AppConfig.testPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="subtitle1">{message}</Typography>
    </ThemeProvider>
  );
}

export default TestPage;
