import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useTheme, ThemeProvider} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import firebase from "firebase";
import '../firebase/initFirebase'

import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TwitterCard from '../components/TwitterCard'

const cloudFunctionUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/getUserTimelineTweet"
const searchCount: number = 50
//const searchCount: number = 200

const layoutType: string = "Grid"   // フォローユーザー数が多いときに横に広がらない
//const layoutType: string = "Box"      // フォローユーザー数が多いときでも横に広がらるがレイアウトが崩れる

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

let collectionName = 'follow-database'

// お気に入りページを表示するコンポーネント
const TimelinePage: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
  // メッセージ
  const [message, setMessage] = useState('loading')

  // フォローユーザーのツイートのタイムライン 
  const [timelineJsx, setTimelineJsx] = useState([]);                 // １人のユーザーのタイムライン
  const [timelineListJsx, setTimelineListJsx] = useState([]);         // 各ユーザーのタイムラインをリストで保管
  const [allUsertimelineJsx, setAllUsertimelineJsx] = useState([]);   // 全ユーザーのタイムライン（時系列順）

  // 副作用フック
  useEffect(() => {
    if( auth.currentUser !== null ) {
      let timelineListJsx_: any = []          
      let allUsertimelineJsx_: any = []

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
          if( userScreenName !== undefined ) {
            // フォローユーザーのツイートをタイムラインで取得
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
                //console.log("tweets : ", tweets)  

                let timelineJsx_: any = []
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
                  
                  timelineJsx_.push(
                    <TwitterCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="250px" imageWidth="1000px" contentsText={tweetText} />
                  )
                  allUsertimelineJsx_.push(
                    <TwitterCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="250px" imageWidth="1000px" contentsText={tweetText} />                    
                  )
                })

                // １人のユーザーのタイムライン
                setTimelineJsx(timelineJsx_)
                
                // 各ユーザーのタイムラインのリストに追加
                if (layoutType == "Grid" ) {
                  timelineListJsx_.push(
                    <Grid item xs={1}>
                      {timelineJsx_}
                    </Grid>
                  )
                }                
                else {
                  timelineListJsx_.push(
                    <Box sx={{ width: "10%", height: "100%"}}>
                      {timelineJsx_}
                    </Box>
                  )                
                }
              })
              .catch((reason) => {
                console.log("ツイートの取得に失敗しました", reason)
                setMessage("ツイートの取得に失敗しました")
              });
          }
          else {
            setMessage("please login")
          }
        })
      })
      
      // 各ユーザーのタイムラインのリスト
      setTimelineListJsx(timelineListJsx_)

      // 全ユーザーのタイムライン
      //setAllUsertimelineJsx(allUsertimelineJsx_)
      console.log( "[before] allUsertimelineJsx_ : ", allUsertimelineJsx_ )

      allUsertimelineJsx_.sort( function(a: any, b: any){
        // ツイート時間順にソート
        //console.log( "a.props.tweetTime : ", a.props.tweetTime )
        //console.log( "b.props.tweetTime : ", b.props.tweetTime )
        if(a.props.tweetTime >= b.props.tweetTime){
          return -1
        }
        else {
          return 1
        }
      })
      setAllUsertimelineJsx(allUsertimelineJsx_)

      // メッセージ更新
      setMessage("")
    }
  }, [])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "timelineJsx : ", timelineJsx )
  console.log( "timelineListJsx : ", timelineListJsx )
  console.log( "allUsertimelineJsx : ", allUsertimelineJsx )
  if (layoutType == "Grid" ) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ width: "3600px" }}>
          {/* ヘッダー表示 */}
          <Header title="Twitter Image Search App" selectedTabIdx={1} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}></Header>
          {/* ボディ表示 */}
          <Typography variant="subtitle1">{message}</Typography>
          { /* タイムライン表示 */ }
          <Grid container spacing={2}>
            { /* 全フォローユーザーのタイムライン表示 */ }
            <Grid item xs={1}>
              {allUsertimelineJsx}
            </Grid>
            { /* 各フォローユーザーのタイムライン表示 */ }
            <Grid item xs={11}>
              <Grid container spacing={2} style={{margin: 0, width: '100%'}}>
                {timelineListJsx}
              </Grid>
            </Grid>            
          </Grid>
        </Box>
      </ThemeProvider>
    );
  }
  else {
    return (
      <ThemeProvider theme={theme}>
        {/* ヘッダー表示 */}
        <Header title="Twitter Image Search App" selectedTabIdx={1} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}></Header>
        {/* ボディ表示 */}
        <Typography variant="subtitle1">{message}</Typography>
        <Box sx={{ width: "5000px", height: "1000px", overflow: "auto", display: "flex", margin: "16px" }}>  { /* display: "flex" で {allUsertimelineJsx} と {timelineListJsx} を左右に配置 */ }
          { /* 全フォローユーザーのタイムライン表示 */ }
          <Box sx={{ width: "10%", height: "100%"}}>
            {allUsertimelineJsx}
          </Box>
          { /* 各フォローユーザーのタイムライン表示 */ }
          <Box sx={{ width: "90%", height: "100%", display: "flex" }}>   { /* display: "flex" で {timelineListJsx} の各 {timelineJsx} を左右に配置 */ }
            {timelineListJsx}         
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default TimelinePage;


