import React from 'react';
import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useTheme, createTheme, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles'

import firebase from "firebase";
import '../firebase/initFirebase'

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  const lightTheme = createTheme({
    palette: {
      type: "light",
    },
  });
  const darkTheme = createTheme({
    palette: {
      type: "dark",
    },
  });
  /*
  const theme = React.useMemo(
    () =>
      createTheme({
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
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.testPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="subtitle1">{message}</Typography>
      {/* レイアウト確認用 */}
      <DragDropContext onDragEnd={onDragEndTweetCard}>
        <Droppable droppableId="droppable ">
          {(provided, snapshot) => (
            <Grid container innerRef={provided.innerRef} {...provided.droppableProps}>
              <Grid item container spacing={8}>   { /* <Grid item container></Grid> の範囲にドロップできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                <Draggable key="0" draggableId="0" index={0}>
                  {(provided, snapshot) => (
                    <Grid item xs={2} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>    { /* <Grid item></Grid> の範囲（＝カード）でドラックできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                      <TweetCard userId="0" userName={"aaa"} userScreenName={"aaa"} profileImageUrl={""} tweetTime="xx:xx:xx" tweetId="0" imageFileUrl="" imageHeight="100px" imageWidth="100px" contentsText="contentsText1" />
                    </Grid>
                  )}
                </Draggable>
                <Draggable key="1" draggableId="1" index={1}>
                  {(provided, snapshot) => (
                    <Grid item xs={2} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>    { /* <Grid item></Grid> の範囲（＝カード）でドラックできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                      <TweetCard userId="1" userName={"bbb"} userScreenName={"bbb"} profileImageUrl={""} tweetTime="xx:xx:xx" tweetId="1" imageFileUrl="" imageHeight="100px" imageWidth="100px" contentsText="contentsText2" />
                    </Grid>
                  )}
                </Draggable>
                <Draggable key="2" draggableId="2" index={2}>
                  {(provided, snapshot) => (
                    <Grid item xs={2} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>    { /* <Grid item></Grid> の範囲（＝カード）でドラックできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                      <TweetCard userId="2" userName={"ccc"} userScreenName={"ccc"} profileImageUrl={""} tweetTime="xx:xx:xx" tweetId="2" imageFileUrl="" imageHeight="100px" imageWidth="100px" contentsText="contentsText3" />
                    </Grid>
                  )}
                </Draggable>
                {provided.placeholder}  { /* placeholderを追加することで、ドラッグしたアイテムがドラッグされる前に使っていたスペースを埋めてくれる */ }
              </Grid>
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
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