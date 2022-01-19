/* eslint-disable */
import React from 'react';
import { useState, useEffect, useRef } from 'react'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles'

import firebase from "firebase";
import '../firebase/initFirebase'

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import AppRoutes, { TimeLinePageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TweetCard from '../components/TweetCard'

import { getUserTimelineTweetsRecursive } from '../twitter_api/TwitterAPI';

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
    width: TimeLinePageConfig.imageWidth,
    margin: "2px",
  },
  // 各ツイートのスタイル
  twitterCard: {
    width: "100%",
    margin: "2px",
    whiteSpace: "normal",     // 折り返えす
  }
})

const timeLineDraggingStyle = (isDragging: any, draggableStyle:any ) => ({
  // change background colour if dragging
  background: isDragging && "lightblue",

  // styles we need to apply on draggables
  ...draggableStyle,
});

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// お気に入りページを表示するコンポーネント
const TimelinePage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist("twitter-image-search-app", "darkMode", false)

  // 独自スタイル
  const style = useStyles()

  // メッセージ
  const [message, setMessage] = useState('loading')

  // フォローユーザーのツイートのタイムライン 
  const [timelineListJsx, setTimelineListJsx] = useState([] as any);         // 各ユーザーのタイムラインをリストで保管
  const [allUsertimelineJsx, setAllUsertimelineJsx] = useState([] as any);   // 全ユーザーのタイムライン（時系列順）
  let timelineJsxRef = React.useRef<any>([]);
  let timelineListJsxRef = React.useRef<any>([]);
  let allUsertimelineJsxRef = React.useRef<any>([]);

  // ログイン確認の副作用フック  
  useEffect(() => {
    // Firebase Auth のログイン情報の初期化処理は、onAuthStateChanged 呼び出し時に行われる（このメソッドを呼び出さないと、ページ読み込み直後に firebase.auth().currentUser の値が null になることに注意）
    const unregisterAuthObserver = auth.onAuthStateChanged( (user: any) => {
      setAuthCurrentUser(user)
    })

    // アンマウント時の処理
    return () => {
      unregisterAuthObserver()
    }
  }, [])

  // 副作用フック
  useEffect(() => {
    if( authCurrentUser !== null ) {
      // フォロー済みユーザーを取得
      firestore.collection(TimeLinePageConfig.collectionNameFollow).doc(authCurrentUser.email).collection(TimeLinePageConfig.collectionNameFollow).get().then( (snapshot)=> {
        console.log("start firestore.collection.then()")        
        snapshot.forEach((document)=> {
          const field = document.data()
          const userId = field.userId
          const userScreenName = field.userScreenName
          if( userScreenName !== undefined ) {
            // フォローユーザーのツイートをタイムラインで取得
            getUserTimelineTweetsRecursive(userId, TimeLinePageConfig.searchCount, true, false, TimeLinePageConfig.searchIter)
              .then((tweets: any) => {     
                console.log("start getUserTimelineTweetsRecursive.then()")
                console.log("tweets : ", tweets)
                timelineJsxRef.current = []
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

                  timelineJsxRef.current.push(
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />
                    </Box>                                        
                  )

                  allUsertimelineJsxRef.current.push(
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />                    
                    </Box>                                        
                  )                           
                  setAllUsertimelineJsx([...allUsertimelineJsx, ...allUsertimelineJsxRef.current])
                })
                
                // 各ユーザーのタイムラインのリストに追加
                if( timelineJsxRef.current.length !== 0 ) {
                  timelineListJsxRef.current.push(
                    <Box className={style.timeLine}>
                      {timelineJsxRef.current}
                    </Box>                                    
                  )
                  setTimelineListJsx([...timelineListJsx, ...timelineListJsxRef.current])
                }

                console.log("end getUserTimelineTweetsRecursive.then()")
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
        console.log("end firestore.collection.then()")
      })

      console.log("start useEffect end firestore.collection")

      // 各ユーザーのタイムラインのリスト
      //setTimelineListJsx(timelineListJsxRef.current)

      // 全ユーザーのタイムライン
      allUsertimelineJsxRef.current.sort( function(a: any, b: any){
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
      setAllUsertimelineJsx(allUsertimelineJsxRef.current)

      // メッセージ更新
      setMessage("")
      console.log("end useEffect")
    }
  }, [authCurrentUser])

  //------------------------
  // イベントハンドラ
  //------------------------
  const onDragEndTimeLine = ((result: any) => {
    console.log('Drag ended');
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    console.log('result.source.index : ', result.source.index);
    console.log('result.destination.index : ', result.destination.index);

    const timelineListJsx__ = Array.from(timelineListJsx);   // ステートの配列 favListJsx を deep copy して、コピーした配列で操作
    const [reorderedTimelineListJsx] = timelineListJsx__.splice(result.source.index, 1);   // splice(index1,index2) : index1 ~ index2 までの要素を取り除く
    timelineListJsx__.splice(result.destination.index, 0, reorderedTimelineListJsx);       // splice(index1,index2,array1) : 第1引数で指定した要素から、第2引数で指定した数を取り除き、第3引数の値を追加します。
    setTimelineListJsx(timelineListJsx__)
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "timelineJsxRef.current : ", timelineJsxRef.current )
  console.log( "timelineListJsxRef.current : ", timelineListJsxRef.current )
  console.log( "allUsertimelineJsxRef.current : ", allUsertimelineJsxRef.current )
  console.log( "timelineListJsx : ", timelineListJsx )
  console.log( "allUsertimelineJsx : ", allUsertimelineJsx )

  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.timeLinePage.index} photoURL={authCurrentUser !== null ? authCurrentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="subtitle1">{message}</Typography>
      {/* タイムライン表示 */}
      <Box className={style.timeLineList}>
        { /* 全フォローユーザーのタイムライン表示 */ }
        <Box className={style.timeLine}>
          {allUsertimelineJsx}
        </Box>
        { /* 各フォローユーザーのタイムライン表示 */ }
        <DragDropContext onDragEnd={onDragEndTimeLine}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div className={style.timeLine} ref={provided.innerRef} {...provided.droppableProps}>
                {timelineListJsx.map( (timeLineJsx: any, index: any) => (
                  <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div className={style.timeLine} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={timeLineDraggingStyle(snapshot.isDragging, provided.draggableProps.style)}>
                        {timeLineJsx}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}  { /* placeholderを追加することで、ドラッグしたアイテムがドラッグされる前に使っていたスペースを埋めてくれる */ }
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </ThemeProvider>
  );
}

export default TimelinePage;
