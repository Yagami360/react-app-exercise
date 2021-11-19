import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useTheme, ThemeProvider} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';

import firebase from "firebase";
import '../firebase/initFirebase'

import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TwitterCard from '../components/TwitterCard'

const cloudFunctionUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/getUserTimelineTweet"
const searchCount: number = 100

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// お気に入りページを表示するコンポーネント
const Follow: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
  // メッセージ
  const [message, setMessage] = useState('loading')

  // コレクション名入力フォームのステートフック
  const [collectionName, setCollectionName] = useState('follow-database')

  // フォローユーザーのツイートのタイムライン 
  const [timelineListJsx, setTimelineListJsx] = useState();

  // 副作用フック
  useEffect(() => {
    if( auth.currentUser !== null ) {
      // フォロー済みユーザーを取得
      firestore.collection(collectionName).doc(auth.currentUser.email).collection(collectionName).get().then( (snapshot)=> {
        let followList_: any = []
        snapshot.forEach((document)=> {
          // document.data() : ドキュメント内のフィールド
          const field = document.data()
          console.log( "field : ", field )

          const userScreenName = field.userScreenName
          console.log( "userScreenName : ", userScreenName )          
          if( userScreenName != undefined ) {
            // フォローユーザーのツイートをタイムラインで表示
            fetch(
              cloudFunctionUrl,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "screen_name": userScreenName,
                  "count": searchCount,
                  "include_rts": true,
                  "exclude_replies": false,
                })
              }
            )
              .then( (response) => {
                //console.log("response : ", response)
                if ( !response.ok) {
                  throw new Error();
                }
                return response.json()
              })
              .then((data) => {        
                console.log("data : ", data)
                const tweets = data["tweets"]
                const statuses = tweets["statuses"]
        
                let timelineListJsx_: any = []
                statuses.forEach((statuse: any)=> {
                  console.log("statuse : ", statuse)  
                  const userName = statuse["user"]["name"]
                  const userScreenName = statuse["user"]["screen_name"]
                  const profileImageUrl = statuse["user"]["profile_image_url"]
                  const tweetTime = statuse["created_at"].replace("+0000","")
                  const tweetText = statuse["text"]
                  const tweetId = statuse["id_str"]
                  //console.log("profileImageUrl : ", profileImageUrl)
                  let imageUrl = "" 
                  if (statuse["entities"]["media"] && statuse["entities"]["media"].indexOf(0)) {
                    if(statuse["entities"]["media"][0]["media_url"]) {
                      imageUrl = statuse["entities"]["media"][0]["media_url"]
                    }
                  }
                  
                  timelineListJsx_.push(
                    <Grid item xs={10} sm={2}>
                      <TwitterCard userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="300px" contentsText={tweetText} />
                    </Grid>
                  )
                })
                setTimelineListJsx(timelineListJsx_)
              })
              .catch((reason) => {
                console.log("ツイートの取得に失敗しました", reason)
                setMessage("ツイートの取得に失敗しました")
              });
          }
        })
      })
    }
  }, [])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <ThemeProvider theme={theme}>
      {/* ヘッダー表示 */}
      <Header title="Twitter Image Search App"></Header>
      {/* ボディ表示 */}
      <Typography variant="h4">Follow Page</Typography>
      <Typography variant="subtitle1">{message}</Typography>
    </ThemeProvider>
  );
}

export default Follow;
