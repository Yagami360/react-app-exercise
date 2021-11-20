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

let collectionName = 'follow-database'

// お気に入りページを表示するコンポーネント
const Follow: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
  // メッセージ
  const [message, setMessage] = useState('loading')

  // フォローユーザーのツイートのタイムライン 
  const [timelineListJsx, setTimelineListJsx] = useState();
  const [allUserTimelineListJsx, setAllUserTimelineListJsx] = useState();

  // 副作用フック
  useEffect(() => {
    if( auth.currentUser !== null ) {
      let allUserTimelineListJsx_: any = []          
      
      // フォロー済みユーザーを取得
      firestore.collection(collectionName).doc(auth.currentUser.email).collection(collectionName).get().then( (snapshot)=> {
        snapshot.forEach((document)=> {
          // document.data() : ドキュメント内のフィールド
          const field = document.data()
          //console.log( "field : ", field )
          const userId = field.userId
          const userScreenName = field.userScreenName
          //console.log( "userId : ", userId )
          //console.log( "userScreenName : ", userScreenName )          
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
                  "user_id": userId,
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
                //console.log("data : ", data)
                const tweets = data["tweets"]
        
                let timelineListJsx_: any = []
                tweets.forEach((tweet: any)=> {
                  //console.log("tweet : ", tweet)  
                  const userId = tweet["user"]["id_str"]
                  const userName = tweet["user"]["name"]
                  const userScreenName = tweet["user"]["screen_name"]
                  const profileImageUrl = tweet["user"]["profile_image_url"]
                  const tweetTime = tweet["created_at"].replace("+0000","")
                  const tweetText = tweet["text"]
                  const tweetId = tweet["id_str"]
                  //console.log("profileImageUrl : ", profileImageUrl)
                  let imageUrl = "" 
                  if (tweet["entities"]["media"] && tweet["entities"]["media"].indexOf(0) && tweet["entities"]["media"][0]["media_url"]) {
                    imageUrl = tweet["entities"]["media"][0]["media_url"]
                  }
                  else {
                    return
                  }
                  
                  timelineListJsx_.push(
                    <Grid item xs={10} sm={2}>
                      <TwitterCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="300px" contentsText={tweetText} />
                    </Grid>
                  )
                })
                setTimelineListJsx(timelineListJsx_)
                setMessage("")

                allUserTimelineListJsx_.append(timelineListJsx)
              })
              .catch((reason) => {
                console.log("ツイートの取得に失敗しました", reason)
                setMessage("ツイートの取得に失敗しました")
              });
          }
        })
      })
      setAllUserTimelineListJsx(allUserTimelineListJsx_)
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
      <Grid container direction="column">
        <Grid item container spacing={2}>
            {timelineListJsx}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Follow;
