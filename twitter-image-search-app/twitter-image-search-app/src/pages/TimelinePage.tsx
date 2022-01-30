/* eslint-disable */
import React from 'react';
import { useState, useEffect, useRef } from 'react'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper';

import firebase from "firebase";
import '../firebase/initFirebase'

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import InfiniteScroll from "react-infinite-scroller"

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
    display: "inline-block",  // 横に配置（折り返さない）
    overflowX: "scroll",      // 水平スクロール有効化
    whiteSpace: "nowrap",     // 折り返さない
    height: "950px",          // 縦のサイズ固定
    overflowY: "scroll",      // 縦スクロールバー    
  },
  // 各ユーザーのタイムラインのスタイル
  timeLine: {
    display: "inline-block",  // 横に配置（折り返さない）
    verticalAlign: "top",     // 上に配置
    width: TimeLinePageConfig.imageWidth,
    margin: "2px",  
    height: "950px",          // 縦のサイズ固定
    overflowY: "scroll",      // 縦スクロールバー
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

  // フォロー済みユーザー
  const userIdsRef = React.useRef<any>([]);
  const userScreenNamesRef = React.useRef<any>([]);
  const [userIds, setUserIds] = useState([] as any);
  const [userScreenNames, setUserScreenNames] = useState([] as any);

  // フォローユーザーのツイートのタイムライン 
  const maxIdListRef = React.useRef<any>([]);
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

  // フォロー済みユーザーを取得する副作用フック
  useEffect(() => {
    if( authCurrentUser !== null ) {
      // フォロー済みユーザーを取得
      firestore.collection(TimeLinePageConfig.collectionNameFollow).doc(authCurrentUser.email).collection(TimeLinePageConfig.collectionNameFollow).get().then( (snapshot)=> {
        //console.log("start firestore.collection.then()")        
        snapshot.forEach((document)=> {
          const field = document.data()
          const userId = field.userId
          const userScreenName = field.userScreenName
          //console.log("userScreenName :", userScreenName )        
          userIdsRef.current.push(userId)
          userScreenNamesRef.current.push(userScreenName)
          maxIdListRef.current.push(undefined)
          //setUserIds([...userIds, userId])
          //setUserScreenNames([...userScreenNames, userScreenName])
        })
        setUserIds(userIdsRef.current)
        setUserScreenNames(userScreenNamesRef.current)
        //console.log("end firestore.collection.then()")
      })
    }
  }, [authCurrentUser])

  // フォロー済みユーザーのタイムラインツイートを取得する副作用フック  
  useEffect(() => {
    allUsertimelineJsxRef.current = []
    timelineListJsxRef.current = []
    for (let i = 0; i < userIdsRef.current.length; i++) {
      // フォローユーザーのツイートをタイムラインで取得
      getUserTimelineTweetsRecursive(userIdsRef.current[i], TimeLinePageConfig.searchCount, true, false, TimeLinePageConfig.searchIter, maxIdListRef.current[i])
        .then(([tweets, maxId]) => {     
          //console.log("start getUserTimelineTweetsRecursive.then()")
          //console.log("tweets : ", tweets)
          maxIdListRef.current[i] = maxId
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
              //setAllUsertimelineJsx([...allUsertimelineJsx, ...allUsertimelineJsxRef.current])
  
              allUsertimelineJsxRef.current.sort( function(a: any, b: any){
                // ツイート時間順にソート
                //console.log( "a.props : ", a.props )
                //console.log( "b.props : ", b.props )
                //console.log( "a.props.children.props.tweetTime : ", a.props.children.props.tweetTime )
                //console.log( "b.props.children.props.tweetTime : ", b.props.children.props.tweetTime )
                if(a.props.children.props.tweetTime >= b.props.children.props.tweetTime){
                  return -1
                }
                else {
                  return 1
                }
              })
            }
          })
          
          // 各ユーザーのタイムラインのリストに追加
          if( timelineJsxRef.current.length !== 0 ) {
            timelineListJsxRef.current.push(
              <Box>
                {timelineJsxRef.current}
              </Box>                                    
            )
            setTimelineListJsx([...timelineListJsx, ...timelineListJsxRef.current])
          }
          //console.log("end getUserTimelineTweetsRecursive.then()")
        })
        .catch((reason) => {
          console.log("ツイートの取得に失敗しました", reason)
          setMessage("ツイートの取得に失敗しました")
        });

      // 各ユーザーのタイムラインのリスト
      setTimelineListJsx(timelineListJsxRef.current)

      // 全ユーザーのタイムライン
      /*
      allUsertimelineJsxRef.current.sort( function(a: any, b: any){
        // ツイート時間順にソート
        //console.log( "a.props : ", a.props )
        //console.log( "b.props : ", b.props )
        console.log( "a.props.children.props.tweetTime : ", a.props.children.props.tweetTime )
        console.log( "b.props.children.props.tweetTime : ", b.props.children.props.tweetTime )
        if(a.props.children.props.tweetTime >= b.props.children.props.tweetTime){
          return -1
        }
        else {
          return 1
        }
      })
      */
      setAllUsertimelineJsx(allUsertimelineJsxRef.current)

      // メッセージ更新
      setMessage("")
      //console.log("end useEffect")
    }
  }, [userIds])

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

  // 無限スクロール発生時のイベントハンドラ
  const onHandleLoadMoreAllUsersTimeLine = (page: any) => {
    console.log( "[onHandleLoadMoreAllUsersTimeLine] page : ", page )
    if(page === 0 || page === 1 || page === 2){ return }

    for (let i = 0; i < userIdsRef.current.length; i++) {
      // フォローユーザーのツイートをタイムラインで取得
      getUserTimelineTweetsRecursive(userIdsRef.current[i], TimeLinePageConfig.searchCountScroll, true, false, 1, maxIdListRef.current[i])
        .then(([tweets, maxId]) => {     
          console.log("tweets : ", tweets)
          maxIdListRef.current[i] = maxId
          timelineJsxRef.current = []
          tweets.forEach((tweet: any)=> {
            const userId = tweet["user"]["id_str"]
            const userName = tweet["user"]["name"]
            const userScreenName = tweet["user"]["screen_name"]
            const profileImageUrl = tweet["user"]["profile_image_url"]
            const tweetTime = tweet["created_at"].replace("+0000","")
            const tweetText = tweet["text"]
            const tweetId = tweet["id_str"]
            let imageUrl = "" 
            if (tweet["entities"]["media"] && tweet["entities"]["media"].indexOf(0) && tweet["entities"]["media"][0]["media_url"]) {
              imageUrl = tweet["entities"]["media"][0]["media_url"]

              const allUsertimelineJsx_ = (
                <Box className={style.twitterCard}>
                  <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={TimeLinePageConfig.imageHeight} imageWidth={TimeLinePageConfig.imageWidth} contentsText={tweetText} />                    
                </Box>                                        
              )                           
              allUsertimelineJsxRef.current.push(allUsertimelineJsx_)                             
              allUsertimelineJsxRef.current.sort( function(a: any, b: any){
                // ツイート時間順にソート
                if(a.props.children.props.tweetTime >= b.props.children.props.tweetTime){
                  return -1
                }
                else {
                  return 1
                }
              })

              //setAllUsertimelineJsx([...allUsertimelineJsx, allUsertimelineJsx_])
              //setAllUsertimelineJsx(allUsertimelineJsxRef.current)
            }
          })
        })
        .catch((reason) => {
          console.log("ツイートの取得に失敗しました", reason)
          setMessage("ツイートの取得に失敗しました")
        });
    }
    setAllUsertimelineJsx(allUsertimelineJsxRef.current)    
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "userIds : ", userIds )
  //console.log( "userScreenNames : ", userScreenNames )
  //console.log( "timelineJsxRef.current : ", timelineJsxRef.current )
  //console.log( "timelineListJsx : ", timelineListJsx )
  //console.log( "timelineListJsxRef.current : ", timelineListJsxRef.current )
  console.log( "allUsertimelineJsxRef.current : ", allUsertimelineJsxRef.current )
  console.log( "allUsertimelineJsx : ", allUsertimelineJsx )

  if( TimeLinePageConfig.enableDragDrop ){
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
          <InfiniteScroll
            pageStart={0}
            loadMore={onHandleLoadMoreAllUsersTimeLine}                   // 項目を読み込む際に処理するコールバック関数
            hasMore={true}                                                // 読み込みを行うかどうかの判定
            loader={<Box className="loader" key={0}>{""}</Box>}           // ロード中の表示
            initialLoad={false}
            className={style.timeLineList}
          > { /* 検索ヒット画像 | react-infinite-scroller を使用した無限スクロールを行う */ }
            <Box className={style.timeLine}>
              {allUsertimelineJsx}
            </Box>
          </InfiniteScroll>
          { /* 各フォローユーザーのタイムライン表示 */ }
          <DragDropContext onDragEnd={onDragEndTimeLine}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div className={style.timeLineList} ref={provided.innerRef} {...provided.droppableProps}>
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
  else {
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
          <InfiniteScroll
            pageStart={0}
            loadMore={onHandleLoadMoreAllUsersTimeLine}                   // 項目を読み込む際に処理するコールバック関数
            hasMore={true}                                                // 読み込みを行うかどうかの判定
            loader={<Box className="loader" key={0}>{""}</Box>}           // ロード中の表示
            initialLoad={false}
            className={style.timeLineList}
          > { /* 検索ヒット画像 | react-infinite-scroller を使用した無限スクロールを行う */ }
            <Box className={style.timeLine}>
              {allUsertimelineJsx}
            </Box>
          </InfiniteScroll>
          { /* 各フォローユーザーのタイムライン表示 */ }
          {timelineListJsx.map( (timeLineJsx: any, index: any) => (
            <Box className={style.timeLine}>
              {timeLineJsx}
            </Box>          
          ))}
        </Box>
      </ThemeProvider>
    );
  }
}

export default TimelinePage;
