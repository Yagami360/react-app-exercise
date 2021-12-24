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

// 文字列を改行コードで分割して改行タグに置換する関数
const convertDescriptionToJsx = (text: any) => {
  let textJsx: any = []
  if( text != undefined ) {
    //text = text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1'>'$1'</a>")   // http://xxx を <a> でのリンクに変換
    textJsx = text.split(/(\n)/g).map((t:any) => (t === '\n') ? <br/> : t)  // 改行文字 \n を区切り文字として配列に分割し、分割した配列の \n を <br/> タグに変換する
    //textJsx = text.match(/<[^>]*>|[^<>]+/g)
    /*
    textJsx_.forEach((t: any) => {
      //textJsx.push( t.split(/(<a href=)/g).map((t:any) => (t === '<a href=') ? <a href="xxx"></a> : t) )
      console.log("match : ", t.match(/<[^>]*>|[^<>]+/g))
      textJsx.push(t.match(/<[^>]*>|[^<>]+/g))
    })
    */
  }
  //console.log( "textJsx : ", textJsx )
  return textJsx
}

//=======================================
// お気に入りページを表示するコンポーネント
//=======================================
// 独自のスタイル定義
const useStyles = makeStyles({
  channelList: {
    width: "5000px",
    overflowY: "scroll",      // 縦スクロールバー
  },
  bannerImg: {
    width: "100%",    
    height: "auto", 
    objectFit: "cover",   
  }
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

  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

  // メッセージ
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

  // ページ読み込み時の副作用フック
  useEffect(() => {
    if( authCurrentUser !== null ) {
      // フォロー済みユーザーを取得
      firestore.collection(FollowPageConfig.collectionNameFollow).doc(authCurrentUser?.email).collection(FollowPageConfig.collectionNameFollow).get()
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
  }, [authCurrentUser])

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

      // チャンネル ID からチャンネル情報取得
      getChannelInfo(getAPIKey(), channelId)
        .then( (channelInfo_:any) => {
          console.log( "[onClickChannelList] channelInfo_ : ", channelInfo_ )          

          // チャンネル詳細 body の JSX
          channelDetailJsxRef.current = (<>
            <Box className={style.bannerImg}>
              <img src={channelInfo_["bannerExternalUrl"]} width="100%" height="auto" />
            </Box>
            <ListItem >
              <Box style={{display:"flex"}}>
                <ListItemAvatar>
                  <Avatar aria-label="avatar" src={channelInfo_["profileImageUrl"]} style={{ width: 80, height: 80 }} />
                </ListItemAvatar>
                <ListItemText 
                  primary={<>
                    <Box mx={1} style={{display:"flex"}}>
                      <Typography component="span" variant="subtitle1" color="textPrimary" style={{display: "inline"}}>{channelInfo_["title"]}</Typography>
                    </Box>
                  </>}
                  secondary={<>
                    <Box mx={1} style={{display:"flex"}}>
                      <Typography component="span" variant="subtitle2" color="textPrimary" style={{display: "inline"}}>{"チャンネル登録者数 : "+channelInfo_["subscriberCount"]}</Typography>
                    </Box>
                  </>}
                />
              </Box>
            </ListItem>                  
            <Divider />
            <Box m={2}>
              <Typography component="span" variant="body1" color="textPrimary" style={{display: "inline"}}>{convertDescriptionToJsx(channelInfo_["description"])}</Typography>
            </Box>
          </>);
          setChannelDetailJsx(channelDetailJsxRef.current)
    
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

  if( authCurrentUser !== null ) {
    return (
      <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
        {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
        <CssBaseline />
        {/* ヘッダー表示 */}
        <Header title="YouTube Video View App" selectedTabIdx={AppConfig.followPage.index} photoURL={authCurrentUser !== null ? authCurrentUser?.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
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
        <Header title="YouTube Video View App" selectedTabIdx={AppConfig.followPage.index} photoURL={authCurrentUser !== null ? authCurrentUser?.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}></Header>
        <Typography variant="h6">{message}</Typography>
      </ThemeProvider>
    );    
  }
}

export default FollowPage;

