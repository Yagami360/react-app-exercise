/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'

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
  const [timelineJsx, setTimelineJsx] = useState([] as any);                 // １人のユーザーのタイムライン
  const [timelineListJsx, setTimelineListJsx] = useState([] as any);         // 各ユーザーのタイムラインをリストで保管
  const [allUsertimelineJsx, setAllUsertimelineJsx] = useState([] as any);   // 全ユーザーのタイムライン（時系列順）

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
      let timelineListJsx_: any = []          
      let allUsertimelineJsx_: any = []

      // フォロー済みユーザーを取得
      firestore.collection(TimeLinePageConfig.collectionNameFollow).doc(authCurrentUser.email).collection(TimeLinePageConfig.collectionNameFollow).get().then( (snapshot)=> {
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

                  /*
                  timelineJsx_.push(
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />
                    </Box>
                  )
                  */                  
                  const tweetJsx_ = (
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />
                    </Box>                    
                  )
                  setTimelineJsx([...timelineJsx_, tweetJsx_])
                  timelineJsx_.push(tweetJsx_)

                  /*
                  allUsertimelineJsx_.push(
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />                    
                    </Box>
                  )
                  */
                  const allUsertweetJsx_ = (
                    <Box className={style.twitterCard}>
                      <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />                    
                    </Box>                    
                  )
                  setAllUsertimelineJsx([...allUsertimelineJsx_, allUsertweetJsx_])
                  allUsertimelineJsx_.push(allUsertweetJsx_)                            
                })

                // １人のユーザーのタイムライン
                console.log( "timelineJsx_ : ", timelineJsx_ )
                //setTimelineJsx(timelineJsx_)
                
                // 各ユーザーのタイムラインのリストに追加
                const timelineListJsx__ = (
                  <Box className={style.timeLine}>
                    {timelineJsx_}
                  </Box>                  
                )
                timelineListJsx_.push(timelineListJsx__)
                setTimelineListJsx([...timelineListJsx_, timelineListJsx__])
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
      //setTimelineListJsx(timelineListJsx_)

      // 全ユーザーのタイムライン
      //setAllUsertimelineJsx(allUsertimelineJsx_)      
      //let allUsertimelineJsx__ = Array.from(allUsertimelineJsx); // deep copy した配列で操作
      //console.log( "[before] allUsertimelineJsx_ : ", allUsertimelineJsx_ )
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
  //console.log( "timelineJsx : ", timelineJsx )
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
