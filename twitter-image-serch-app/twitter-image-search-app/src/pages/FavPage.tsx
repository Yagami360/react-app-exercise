import React from 'react';
import { useState, useEffect } from 'react'

import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import firebase from "firebase";
import '../firebase/initFirebase'

import AppRoutes, { FavPageConfig } from '../Config'
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TweetCard from '../components/TweetCard'

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// お気に入りページを表示するコンポーネント
const FavPage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // メッセージ
  const [message, setMessage] = useState('loading')

  // お気に入りリスト 
  const [favListJsx, setFavListJsx] = useState();

  // コレクション名からコレクション内のデータを取得する副作用フック。
  useEffect(() => {
    console.log("auth.currentUser : ", auth.currentUser)
    // ログイン済みに場合のみ表示
    if (auth.currentUser !== null) {
      // firestore.collection(コレクション名) : コレクションにアクセスするためのオブジェクト取得
      // firestore.collection(コレクション名).get() : コレクションにアクセスするためのオブジェクトからコレクションを取得。get() は非同期のメソッドで Promise を返す。そのため、非同期処理が完了した後 then() で非同期完了後の処理を定義する
      firestore.collection(FavPageConfig.collectionNameFav).doc(auth.currentUser.email).collection(FavPageConfig.collectionNameFav).get().then(
        // snapshot には、Firestore のコレクションに関連するデータやオブジェクトが入る
        (snapshot)=> {
          let favListJsx_: any = []

          // snapshot.forEach((document)=> {..}) : snapshot から順にデータを取り出して処理を行う。無名関数の引数 document には、コレクション内の各ドキュメントが入る
          snapshot.forEach((document)=> {
            // document.data() : ドキュメント内のフィールド
            const field = document.data()

            // フィールドの値を TweetCard の形式に変換して追加
            favListJsx_.push(
              <Grid item xs={4}>
                <TweetCard userId={field.userId} userName={field.userName} userScreenName={field.userScreenName} profileImageUrl={field.userImageUrl} tweetTime={field.tweetTime} tweetId={field.tweetId} imageFileUrl={field.tweetImageFileUrl} imageHeight="500px" imageWidth="2000px" contentsText={field.tweetText} />
              </Grid>
            )
          })
          
          setFavListJsx(favListJsx_)
        }
      )
      setMessage("")      
    }
    else {
      setMessage("Please login")
    }
  }, [])
  
  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <Box>
      {/* ヘッダー表示 */}
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.favPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}></Header>
      {/* ボディ表示 */}
      <Typography variant="h6">{message}</Typography>
      <Grid container direction="column">
        <Grid item container spacing={2}>
            {favListJsx}
        </Grid>
      </Grid>
    </Box>
  );
}

export default FavPage;
