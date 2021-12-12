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
import { getAPIKey, getVideoChatInfos } from '../youtube_api/YouTubeDataAPI';

let chatNextPageToken: any = ""
let chatsJsx_: any[] = []

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
  darkMode: boolean;
}

const LiveChatList: React.FC<Props> = ({ 
  children,
  liveChatId,
  liveBroadcastContent,
  darkMode,
}) => {
  //console.log( "call LiveChatList" )
  //console.log( "[LiveChatList] liveChatId : ", liveChatId )
  //console.log( "[LiveChatList] liveBroadcastContent : ", liveBroadcastContent )

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

    // useEffect 内で非同期処理の関数を定義
    const initPageAsync = async () => {
      // ライブチャット情報を取得
      if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
        let videoChatInfos_ = undefined
        let chatNumber_ = undefined
        try {
          [videoChatInfos_, chatNumber_, chatNextPageToken] = await getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsChat, VideoWatchPageConfig.iterChat, chatNextPageToken)
          //console.log( "videoChatInfos_ : ", videoChatInfos_ )    
          //console.log( "chatNextPageToken : ", chatNextPageToken )
        }
        catch (err) {
          console.error(err);
          setMessage("チャットの取得に失敗しました")
        }

        videoChatInfos_.forEach((videoChatInfo_: any)=> {
          const chatJsx_ = (<>
            <ListItem>
              <Box style={{display:"flex"}}>
                { /* アイコン画像 */ }
                <ListItemAvatar>
                  <Link href={videoChatInfo_["channelUrl"]}><Avatar aria-label="avatar" src={videoChatInfo_["profileImageUrl"]} style={{ width: 60, height: 60 }} /></Link>
                </ListItemAvatar>
                <ListItemText 
                  primary={<>
                    <Box mx={1} style={{display:"flex"}}>
                      { /* ユーザー名 */ }
                      <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>{videoChatInfo_["displayName"]}</Typography>
                      { /* チャット投稿日 */ }
                      <Box mx={2} style={{display:"flex"}}>
                        <Typography component="span" variant="body2" color="textSecondary" style={{display: "inline"}}>{videoChatInfo_["publishedAt"]}</Typography>
                      </Box>
                    </Box>
                  </>}
                  secondary={<>
                    <Box mx={2}>
                      { /* コメント */ }
                      <Typography variant="subtitle2">{videoChatInfo_["displayMessage"]}</Typography>
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
      }
    }

    // 非同期処理実行
    if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
      initPageAsync()
    }
  }, [liveChatId, liveBroadcastContent])

  // setInterval() を呼び出す副作用フック。レンダーの度にsetIntervalが何度も実行されて、オーバーフローやメモリリークが発生するので副作用フック内で行う
  useEffect( () => {
    //console.log( "call useEffect2 (setInterval)" )

    // 一定時間経過度に呼び出されるイベントハンドラ
    // setInterval(()=>{処理}, インターバル時間msec) : 一定時間度に {} で定義した処理を行う
    if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
      let timerChat = setInterval( ()=>{
        //console.log( "call timerChat" )
        //console.log( "[LiveChatList in useEffect2] liveChatId : ", liveChatId )
        //console.log( "[LiveChatList in useEffect2] liveBroadcastContent : ", liveBroadcastContent )
  
        // ライブチャット情報を取得
        if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
          //console.log( "[LiveChatList in useEffect2] chatNextPageToken : ", chatNextPageToken )
          getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsIntervalChat, 1, chatNextPageToken )
            .then( ([videoChatInfos_, chatNumber_, nextPageToken_ ]) => {
              //console.log( "[timerChat] videoChatInfos_ : ", videoChatInfos_ )     
              chatNextPageToken = nextPageToken_         

              videoChatInfos_.forEach((videoChatInfo_: any)=> {
                const chatJsx_ = (<>
                  <ListItem>
                    <Box style={{display:"flex"}}>
                      { /* アイコン画像 */ }
                      <ListItemAvatar>
                        <Link href={videoChatInfo_["channelUrl"]}><Avatar aria-label="avatar" src={videoChatInfo_["profileImageUrl"]} style={{ width: 60, height: 60 }} /></Link>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<>
                          <Box mx={1} style={{display:"flex"}}>
                            { /* ユーザー名 */ }
                            <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>{videoChatInfo_["displayName"]}</Typography>
                            { /* チャット投稿日 */ }
                            <Box mx={2} style={{display:"flex"}}>
                              <Typography component="span" variant="body2" color="textSecondary" style={{display: "inline"}}>{videoChatInfo_["publishedAt"]}</Typography>
                            </Box>
                          </Box>
                        </>}
                        secondary={<>
                          <Box mx={2}>
                            { /* コメント */ }
                            <Typography variant="subtitle2">{videoChatInfo_["displayMessage"]}</Typography>
                          </Box>
                        </>}
                      />
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </>)

                setChatsJsx([...chatsJsx_, chatJsx_])
                chatsJsx_.unshift(chatJsx_)
              })
  
              //setChatsJsx(chatsJsx_)

              // チャット表示を下にスクロール
              //scrollBottomRef?.current?.scrollIntoView({behavior: "smooth", block: "end",});
              //console.log( "scrollBottomRef : ", scrollBottomRef )
            })
            .catch(err => {
              console.log(err);
            })    
            .finally( () => {
            })
        }
      }, VideoWatchPageConfig.intervalTimeChat );
  
      // アンマウント処理
      return () => {
        clearInterval(timerChat)
        console.log('コンポーネントがアンマウントしました')
      }
    }
  }, [liveChatId, liveBroadcastContent])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "chatsJsx: ", chatsJsx )
  if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
    return (
      <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
        { /* チャット表示 */ }
        <Box style={{width: "400px"}} ml={2}>
          <Paper variant="outlined" square>
            <Box m={1}>
              <Typography variant="h6">{"チャット"}</Typography>
            </Box>
          </Paper>
          <Box className={style.chatTimeLineStyle}>
            <Paper elevation={1} variant="outlined" square>
              <Typography variant="h6">{message}</Typography>
              {chatsJsx}
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
    )
  }
  else {
    return (
      <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      </ThemeProvider>
    )
  }
}

export default LiveChatList;

//{ /* ref={scrollBottomRef} で useRef() で作成した ref を <div> 設定する */ }
//<div ref={scrollBottomRef} />