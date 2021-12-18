/* eslint-disable */
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar'
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Paper from '@material-ui/core/Paper';

import firebase from "firebase";
import '../firebase/initFirebase'

import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';

// 独自のスタイル定義
const useStyles = makeStyles({
  chatTimeLineStyle: {
    height: "780px",
    overflowY: "scroll",      // 縦スクロールバー
  },
})

//===========================================
// ライブ動画のチャットを表示するコンポーネント
//===========================================
// コンポーネントの引数
type Props = {
  liveChatId: string;
  liveBroadcastContent: string;
  videoChatInfos: any;
  darkMode: boolean;
}

const LiveChatList: React.FC<Props> = ({ 
  children,
  liveChatId,
  liveBroadcastContent,
  videoChatInfos,
  darkMode,
}) => {
  //console.log( "call LiveChatList" )
  //console.log( "[LiveChatList] liveChatId : ", liveChatId )
  //console.log( "[LiveChatList] liveBroadcastContent : ", liveBroadcastContent )
  //console.log( "[LiveChatList] videoChatInfos: ", videoChatInfos )

  //------------------------
  // フック
  //------------------------
  // 独自スタイル
  const style = useStyles()

  // チャット情報
  const [chatsJsx, setChatsJsx] = useState([] as any)
  const [message, setMessage] = useState("loading chats")
  //const scrollBottomRef = useRef<HTMLDivElement>(null);  // useRef() : HTML の ref属性への参照

  // ページ読み込み時の副作用フック
  useEffect( () => {
    //console.log( "call useEffect1 (init)" )
    //console.log( "[LiveChatList in useEffect1] liveChatId : ", liveChatId )
    //console.log( "[LiveChatList in useEffect1] liveBroadcastContent : ", liveBroadcastContent )

    // ライブチャット情報を取得
    let chatsJsx_: any[] = []
    videoChatInfos.forEach((videoChatInfo: any)=> {
      const chatJsx_ = (<>
        <ListItem>
          <Box style={{display:"flex"}}>
            { /* アイコン画像 */ }
            <ListItemAvatar>
              <Link href={videoChatInfo["channelUrl"]}><Avatar aria-label="avatar" src={videoChatInfo["profileImageUrl"]} style={{ width: 60, height: 60 }} /></Link>
            </ListItemAvatar>
            <ListItemText 
              primary={<>
                <Box mx={1} style={{display:"flex"}}>
                  { /* ユーザー名 */ }
                  <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>{videoChatInfo["displayName"]}</Typography>
                  { /* チャット投稿日 */ }
                  <Box mx={2} style={{display:"flex"}}>
                    <Typography component="span" variant="body2" color="textSecondary" style={{display: "inline"}}>{videoChatInfo["publishedAt"]}</Typography>
                  </Box>
                </Box>
              </>}
              secondary={<>
                <Box mx={2}>
                  { /* コメント */ }
                  <Typography component={'span'} variant="subtitle2">{videoChatInfo["displayMessage"]}</Typography>
                </Box>
              </>}
            />
          </Box>
        </ListItem>
        <Divider variant="inset" component="li" />
      </>)

      //setChatsJsx([...chatsJsx_, chatJsx_])
      chatsJsx_.unshift(chatJsx_)
    })

    setChatsJsx(chatsJsx_)
    setMessage("")
  }, [liveChatId, liveBroadcastContent, videoChatInfos])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "[LiveChatList] chatsJsx: ", chatsJsx )
  if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
    return (
      <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
        { /* チャット表示 */ }
        <Box style={{width: "400px"}} ml={2}>
          <Paper variant="outlined" square>
            <Box m={1}>
              <Typography component={'h6'} variant="h6">チャット</Typography>
            </Box>
          </Paper>
          <Box className={style.chatTimeLineStyle}>
            <Paper elevation={1} variant="outlined" square>
              <Typography component={'h6'} variant="h6">{message}</Typography>
              {chatsJsx}
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
    )
  }
  else {
    return (
      <div></div>
    )
  }
}

export default LiveChatList;

//{ /* ref={scrollBottomRef} で useRef() で作成した ref を <div> 設定する */ }
//<div ref={scrollBottomRef} />