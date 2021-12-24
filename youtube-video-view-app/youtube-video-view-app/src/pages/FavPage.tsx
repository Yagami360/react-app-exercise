/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import firebase from "firebase";
import '../firebase/initFirebase'

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import AppConfig, { FavPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import YouTubeVideoInfoCard from '../components/YouTubeVideoInfoCard'
import { getAPIKey, getChannelInfo, getVideoInfo } from '../youtube_api/YouTubeDataAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//=======================================
// お気に入りページを表示するコンポーネント
//=======================================
const FavPage: React.VFC = () => {
  //------------------------
  // スタイル定義
  //------------------------
  const youtubeVideoInfoCardDraggingStyle = (isDragging: any, draggableStyle:any ) => ({
    // change background colour if dragging
    background: isDragging && "lightblue",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

  // お気に入りリスト 
  const [favListJsx, setFavListJsx] = useState([] as any);
  
  // メッセージ
  const [message, setMessage] = useState('loading')

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

  // FireStore からお気に入りデータを読み込む副作用フック
  useEffect(() => {
    //console.log("auth.currentUser : ", auth.currentUser)
    // ログイン済みに場合のみ表示
    if (authCurrentUser !== null) {
      // firestore.collection(コレクション名) : コレクションにアクセスするためのオブジェクト取得
      // firestore.collection(コレクション名).get() : コレクションにアクセスするためのオブジェクトからコレクションを取得。get() は非同期のメソッドで Promise を返す。そのため、非同期処理が完了した後 then() で非同期完了後の処理を定義する
      firestore.collection(FavPageConfig.collectionNameFav).doc(authCurrentUser?.email).collection(FavPageConfig.collectionNameFav).get().then(
        // snapshot には、Firestore のコレクションに関連するデータやオブジェクトが入る
        (snapshot)=> {
          let favListJsx_: any[] = []

          // snapshot.forEach((document)=> {..}) : snapshot から順にデータを取り出して処理を行う。無名関数の引数 document には、コレクション内の各ドキュメントが入る
          snapshot.forEach((document)=> {
            // document.data() : ドキュメント内のフィールド
            const field = document.data()
            //console.log( "field : ", field ) 

            // YoutubeAPI から統計情報を再度取得
            getChannelInfo(getAPIKey(), field.channelId)
              .then( (channelInfo_: any) => {
                getVideoInfo(getAPIKey(), field.videoId)
                  .then( (videoInfo_: any) => {
                    // フィールドの値と最新の統計情報を YouTubeVideoInfoCard の形式に変換して追加
                    const favJsx_ = (
                      <YouTubeVideoInfoCard 
                        channelId={field.channelId} channelTitle={field.channelTitle} profileImageUrl={channelInfo_["profileImageUrl"]} subscriberCount={channelInfo_["subscriberCount"]}
                        videoId={field.videoId} title={field.title} publishTime={field.publishedAt} description={field.description} categoryTitle={field.categoryTitle}
                        thumbnailsUrl={field.thumbnailsUrl} imageHeight={FavPageConfig.imageHeight} imageWidth={FavPageConfig.imageWidth}
                        viewCount={videoInfo_["viewCount"]} likeCount={videoInfo_["likeCount"]} dislikeCount={videoInfo_["dislikeCount"]} favoriteCount={videoInfo_["favoriteCount"]}
                        tags={videoInfo_["tags"]}
                      />
                    )
                    setFavListJsx([...favListJsx_, favJsx_]) // ステートの配列に追加
                    favListJsx_.push(favJsx_)
                  })
                  .catch(err => {
                    console.log(err);
                    setMessage("動画情報の取得に失敗しました" )
                  })                
              })
              .catch(err => {
                console.log(err);
                setMessage("チャンネル情報の取得に失敗しました" )
              })
          })

          console.log( "favListJsx_ : ", favListJsx_ )
        }
      )
      setMessage("")      
    }
    else {
      setMessage("Please login")
    }
  }, [authCurrentUser])  

  //------------------------
  // イベントハンドラ
  //------------------------
  const onDragEndTweetCard = ((result: any) => {
    //console.log('Drag ended');
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    //console.log('result.source.index : ', result.source.index);
    //console.log('result.destination.index : ', result.destination.index);

    const favListJsx_ = Array.from(favListJsx);   // ステートの配列 favListJsx を deep copy して、コピーした配列で操作
    const [reorderedFavListJsx] = favListJsx_.splice(result.source.index, 1);   // splice(index1,index2) : index1 ~ index2 までの要素を取り除く
    favListJsx_.splice(result.destination.index, 0, reorderedFavListJsx);       // splice(index1,index2,array1) : 第1引数で指定した要素から、第2引数で指定した数を取り除き、第3引数の値を追加します。
    setFavListJsx(favListJsx_)
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log("favListJsx : ", favListJsx )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.favPage.index} photoURL={authCurrentUser !== null ? authCurrentUser?.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="h6">{message}</Typography>
      <Box m={2}>
        <Grid container>
          <DragDropContext onDragEnd={onDragEndTweetCard}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <Grid item container spacing={2} innerRef={provided.innerRef} {...provided.droppableProps}>   { /* <Grid item container></Grid> の範囲にドロップできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                  {favListJsx.map( (favJsx: any, index: any) => (
                    <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                      {(provided, snapshot) => (
                        <Grid item xs={3} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={youtubeVideoInfoCardDraggingStyle(snapshot.isDragging, provided.draggableProps.style)}>    { /* <Grid item></Grid> の範囲（＝カード）でドラックできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                          {favJsx}
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}  { /* placeholderを追加することで、ドラッグしたアイテムがドラッグされる前に使っていたスペースを埋めてくれる */ }
                </Grid>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default FavPage;

