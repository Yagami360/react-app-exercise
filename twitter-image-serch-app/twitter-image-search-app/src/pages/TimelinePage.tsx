import React from 'react';
import { useState, useEffect } from 'react'

import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles'

import firebase from "firebase";
import '../firebase/initFirebase'

import AppRoutes, { TimeLinePageConfig } from '../Config'
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TweetCard from '../components/TweetCard'

// 独自のスタイル定義
const useStyles = makeStyles({
  // 全ユーザーのタイムライン全体のスタイル
  timeLineList: {
    overflowX: "scroll",      // 水平スクロール有効化
    whiteSpace: "nowrap",     // 折り返さない
  },
  // 各ユーザーのタイムラインのスタイル
  timeLine: {
    display: "inline-block",  // 横に配置（折り返さない）
    verticalAlign: "top",     // 上に配置
    width: "300px",
    margin: "2px",
  },
  // 各ツイートのスタイル
  twitterCard: {
    width: "100%",
    margin: "2px",
    whiteSpace: "normal",     // 折り返えす
  }
})

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// お気に入りページを表示するコンポーネント
const TimelinePage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // 独自スタイル
  const style = useStyles()

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
      firestore.collection(TimeLinePageConfig.collectionNameFollow).doc(auth.currentUser.email).collection(TimeLinePageConfig.collectionNameFollow).get().then( (snapshot)=> {
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
              TimeLinePageConfig.cloudFunctionGetTimelineUrl,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "user_id": userId,
                  "count": TimeLinePageConfig.searchCount,
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
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="250px" imageWidth="1000px" contentsText={tweetText} />
                    </Box>
                  )
                  allUsertimelineJsx_.push(
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="250px" imageWidth="1000px" contentsText={tweetText} />                    
                    </Box>
                  )
                })

                // １人のユーザーのタイムライン
                setTimelineJsx(timelineJsx_)
                
                // 各ユーザーのタイムラインのリストに追加
                timelineListJsx_.push(
                  <Box className={style.timeLine}>
                    {timelineJsx_}
                  </Box>
                )                
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
      //console.log( "[before] allUsertimelineJsx_ : ", allUsertimelineJsx_ )
      //setAllUsertimelineJsx(allUsertimelineJsx_)
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
  return (
    <Box>
      {/* ヘッダー表示 */}
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.timeLinePage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}></Header>
      {/* ボディ表示 */}
      <Typography variant="subtitle1">{message}</Typography>
      {/* タイムライン表示 */}
      <Box className={style.timeLineList}>
        { /* 全フォローユーザーのタイムライン表示 */ }
        <Box className={style.timeLine}>
          {allUsertimelineJsx}
        </Box>
        { /* 各フォローユーザーのタイムライン表示 */ }
        <Box className={style.timeLine}>
          {timelineListJsx}
        </Box>
      </Box>
    </Box>
  );
}

export default TimelinePage;