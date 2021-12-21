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
import { getAPIKey, getChannelInfo, getVideoInfo } from '../youtube_api/YouTubeDataAPI';

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
  //const channelInfos = React.useRef<any>([]);
  const [channelInfos, setChannelInfos] = useState([] as any)
  const [channelInfosJsx, setChannelInfosJsx] = useState([] as any)
  const [selectedChannelIndex, setSelectedChannelIndex] = React.useState(0);

  // ページ読み込み時の副作用フック
  useEffect(() => {
    if( auth.currentUser !== null ) {
      // フォロー済みユーザーを取得
      let channelInfos_: any = []
      let channelInfosJsx_: any = []
      firestore.collection(FollowPageConfig.collectionNameFollow).doc(auth.currentUser.email).collection(FollowPageConfig.collectionNameFollow).get()
        .then( (snapshot)=> {
          let listIndex = 0
          snapshot.forEach((document)=> {
            // document.data() : ドキュメント内のフィールド
            const field = document.data()
            //console.log( "field : ", field )

            channelInfos_.push({
              "channelId" : field["channelId"],
              "title" : field["channelTitle"],
              "profileImageUrl" : field["profileImageUrl"],
              "subscriberCount" : undefined,            
            })

            channelInfosJsx_.push(
              <ListItem onClick={(event:any) => onClickChannelList(event, listIndex)}>
                <Box style={{display:"flex"}}>
                  { /* アイコン画像 */ }
                  <ListItemAvatar>
                    <Avatar aria-label="avatar" src={field["profileImageUrl"]} style={{ width: 60, height: 60 }} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<>
                      <Box mx={1} style={{display:"flex"}}>
                        { /* チャンネル名 */ }
                        <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>{field["channelTitle"]}</Typography>
                      </Box>
                    </>}
                  />
                </Box>
              </ListItem>
            )
            listIndex += 1
          })
          setChannelInfos([...channelInfos, ...channelInfos_])
          setChannelInfosJsx([...channelInfosJsx, ...channelInfosJsx_])
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
    const channelInfosJsx_ = Array.from(channelInfosJsx);   // ステートの配列 channelInfosJsx を deep copy して、コピーした配列で操作
    const [reorderedChannelInfosJsx] = channelInfosJsx_.splice(result.source.index, 1);   // splice(index1,index2) : index1 ~ index2 までの要素を取り除く
    channelInfosJsx_.splice(result.destination.index, 0, reorderedChannelInfosJsx);       // splice(index1,index2,array1) : 第1引数で指定した要素から、第2引数で指定した数を取り除き、第3引数の値を追加します。
    setChannelInfosJsx(channelInfosJsx_)
  })

  const onClickChannelListAll = ((event: any) => {
    console.log( "[onClickChannelListAll] event : ", event )
  })

  const onClickChannelList = ((event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number,) => {
    console.log( "[onClickChannelList] event : ", event )
    console.log( "[onClickChannelList] index : ", index )
    setSelectedChannelIndex(index)

    // チャンネル ID を取得
    if( channelInfos.length >= index ) {
      const channelId = channelInfos[index]["channelId"]
      console.log( "[onClickChannelList] channelId : ", channelId )
    }
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log("channelInfos : ", channelInfos )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.followPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      {/* ボディ表示 */}
      <Typography variant="h6">{message}</Typography>
      <Box>
        { /* チャンネルリスト */ }
        <Box style={{width: "300px"}}>
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
                    {channelInfosJsx.map( (channelInfoJsx: any, index: any) => (
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
        <Box m={2}>

        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default FollowPage;

