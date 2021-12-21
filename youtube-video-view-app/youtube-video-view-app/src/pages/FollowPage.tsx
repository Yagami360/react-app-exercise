/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar'
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';

import firebase from "firebase";
import '../firebase/initFirebase'

import AppConfig, { FollowPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import { getAPIKey, getChannelInfo, getVideoInfo, searchVideos } from '../youtube_api/YouTubeDataAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//=======================================
// お気に入りページを表示するコンポーネント
//=======================================
// 独自のスタイル定義
const useStyles = makeStyles({
  channelList: {
    width: "5000px",
    overflowY: "scroll",      // 縦スクロールバー
  },
})

const FollowPage: React.VFC = () => {
  //------------------------
  // スタイル定義
  //------------------------
  // 独自スタイル
  const style = useStyles()

  // ドラック＆ドロップ
  const channelListDraggingStyle = (isDragging: any, draggableStyle:any ) => ({
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
  const [message, setMessage] = useState('loading pages..')

  // チャンネル情報
  const channelInfosRef = React.useRef<any>([]);
  const [channelInfos, setChannelInfos] = useState([] as any)
  const [selectedChannelIndex, setSelectedChannelIndex] = React.useState(0);

  // チャンネル一覧
  const channelListJsxRef = React.useRef<any>([]);
  const [channelListJsx, setChannelListJsx] = useState([] as any)

  // チャンネル詳細
  const channelDetailJsxRef = React.useRef<any>();
  const [channelDetailJsx, setChannelDetailJsx] = useState()

  // ページ読み込み時の副作用フック
  useEffect(() => {
    if( auth.currentUser !== null ) {
      // フォロー済みユーザーを取得
      firestore.collection(FollowPageConfig.collectionNameFollow).doc(auth.currentUser.email).collection(FollowPageConfig.collectionNameFollow).get()
        .then( (snapshot)=> {
          let index = 0
          channelInfosRef.current = []
          channelListJsxRef.current = []
          snapshot.forEach((document) => {
            // document.data() : ドキュメント内のフィールド
            const field = document.data()
            //console.log( "field : ", field )
            console.log( "index : ", index )

            channelInfosRef.current.push({
              "channelId" : field["channelId"],
              "title" : field["channelTitle"],
              "profileImageUrl" : field["profileImageUrl"],
              "subscriberCount" : undefined,            
            })

            channelListJsxRef.current.push(
              <ListItem onClick={(event:any) => onClickChannelList(event, index)}>
                <Box style={{display:"flex"}}>
                  <ListItemAvatar>
                    <Avatar aria-label="avatar" src={field["profileImageUrl"]} style={{ width: 60, height: 60 }} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<>
                      <Box mx={1} style={{display:"flex"}}>
                        <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>{field["channelTitle"]}</Typography>
                      </Box>
                    </>}
                  />
                </Box>
              </ListItem>
            )

            index += 1
          })

          setChannelInfos(channelInfosRef.current)
          setChannelListJsx(channelListJsxRef.current)
        })
      setMessage("")
    }
    else {
      setMessage("Please login")
    }
  }, [])

  //------------------------
  // イベントハンドラ
  //------------------------
  const onDragEndChannelList = ((result: any) => {
    //console.log('Drag ended');
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    //console.log('result.source.index : ', result.source.index);
    //console.log('result.destination.index : ', result.destination.index);
    const channelListJsx_ = Array.from(channelListJsx);   // ステートの配列 channelListJsx を deep copy して、コピーした配列で操作
    const [reorderedChannelInfosJsx] = channelListJsx_.splice(result.source.index, 1);   // splice(index1,index2) : index1 ~ index2 までの要素を取り除く
    channelListJsx_.splice(result.destination.index, 0, reorderedChannelInfosJsx);       // splice(index1,index2,array1) : 第1引数で指定した要素から、第2引数で指定した数を取り除き、第3引数の値を追加します。
    setChannelListJsx(channelListJsx_)
  })

  const onClickChannelListAll = ((event: any) => {
    console.log( "[onClickChannelListAll] event : ", event )
  })

  const onClickChannelList = ((event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number,) => {
    console.log( "[onClickChannelList] event : ", event )
    console.log( "[onClickChannelList] index : ", index )
    index = 1
    setSelectedChannelIndex(index)

    if( channelInfosRef.current.length > 0 ) {
      // チャンネル ID を取得
      const channelId = channelInfosRef.current[index]["channelId"]
      //const channelId = "UCeLzT-7b2PBcunJplmWtoDg"
      console.log( "[onClickChannelList] channelId : ", channelId )

      // チャンネル詳細
      console.log( "[onClickChannelList] channelInfosRef.current : ", channelInfosRef.current )      
      channelDetailJsxRef.current = (<>
        <ListItem >
          <Box style={{display:"flex"}}>
            <ListItemAvatar>
              <Avatar aria-label="avatar" src={channelInfosRef.current[index]["profileImageUrl"]} style={{ width: 80, height: 80 }} />
            </ListItemAvatar>
            <ListItemText 
              primary={<>
                <Box mx={1} style={{display:"flex"}}>
                  <Typography component="span" variant="subtitle1" color="textPrimary" style={{display: "inline"}}>{channelInfosRef.current[index]["title"]}</Typography>
                </Box>
              </>}
              secondary={<>
                <Box mx={1} style={{display:"flex"}}>
                  <Typography component="span" variant="subtitle2" color="textPrimary" style={{display: "inline"}}>{"チャンネル登録者数 : "+channelInfosRef.current[index]["subscriberCount"]}</Typography>
                </Box>
              </>}
            />
          </Box>
        </ListItem>        
      </>);
      setChannelDetailJsx(channelDetailJsxRef.current)

      // チャンネル ID からチャンネルの動画取得
      searchVideos(getAPIKey(), "", FollowPageConfig.maxResults, FollowPageConfig.iterSearchVideo, "", channelId, "date")
        .then( ([searchVideoInfos_, totalNumber_, searchNumber_, nextPageToken_]) => {
          console.log( "[onClickChannelList] searchVideoInfos_ : ", searchVideoInfos_ )          

          // チャンネル動画一覧
          /*
          searchVideoInfos_.foreach((searchVideoInfo_: any) => {
          })
          */

        })
        .catch(err => {
          console.log(err);
          setMessage("チャンネルの動画検索に失敗しました" )
        })    
        .finally( () => {
        })
    }
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log("channelInfos : ", channelInfos )
  console.log("channelListJsx : ", channelListJsx )

  if( auth.currentUser !== null ) {
    return (
      <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
        {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
        <CssBaseline />
        {/* ヘッダー表示 */}
        <Header title="YouTube Video View App" selectedTabIdx={AppConfig.followPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
        {/* ボディ表示 */}
        <Typography variant="h6">{message}</Typography>
        <Box style={{display: "flex"}}>
          { /* チャンネルリスト */ }
          <Box style={{width: "15%"}}>
            <Paper variant="outlined" square>
            { /* 全チャンネル */ }
              <ListItem onClick={onClickChannelListAll}>
                <Box style={{display:"flex"}}>
                  { /* アイコン画像 */ }
                  <ListItemAvatar>
                    <Avatar aria-label="avatar" src={""} style={{ width: 60, height: 60 }} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<>
                      <Box mx={1} style={{display:"flex"}}>
                        { /* チャンネル名 */ }
                        <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>全チャンネル</Typography>
                      </Box>
                    </>}
                  />
                </Box>
              </ListItem>
              <Divider />
              { /* 各チャンネル */ }
              <DragDropContext onDragEnd={onDragEndChannelList}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>   { /* <div></div> の範囲にドロップできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                      {channelListJsx.map( (channelInfoJsx: any, index: any) => (
                        <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={channelListDraggingStyle(snapshot.isDragging, provided.draggableProps.style)}>    { /* <div></div> の範囲（＝カード）でドラックできるようにする。このタグ内に provided 引数を設定することで、この引数に含まれる値を元にどのアイテムがどの位置に移動されたかをトラッキングできるようになる */ }
                              {channelInfoJsx}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}  { /* placeholderを追加することで、ドラッグしたアイテムがドラッグされる前に使っていたスペースを埋めてくれる */ }
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>
          </Box>
          { /* チャンネル詳細 */ }
          <Box style={{width: "85%"}}>
            {channelDetailJsx}
          </Box>
        </Box>
      </ThemeProvider>
    )
  }
  else {
    return (
      <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
        {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
        <CssBaseline />
        {/* ヘッダー表示 */}
        <Header title="YouTube Video View App" selectedTabIdx={AppConfig.followPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
        <Typography variant="h6">ログインしてください</Typography>
      </ThemeProvider>
    );    
  }
}

export default FollowPage;

