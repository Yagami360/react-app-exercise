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

// 独自のスタイル定義
const useStyles = makeStyles({
  chatTimeLineStyle: {
    height: "780px",
    overflowY: "scroll",      // 縦スクロールバー
  },
})

//-----------------------------------------------
// ライブ動画のチャットを表示するコンポーネント
//-----------------------------------------------
// コンポーネントの引数
type Props = {
  liveChatId: string;
  liveBroadcastContent: string;
}

const LiveChatList: React.FC<Props> = ({ 
  children,
  liveChatId,
  liveBroadcastContent,
}) => {
  let chatsJsx_: any = []
  let chatNextPageToken_: any = ""

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // 独自スタイル
  const style = useStyles()

  // チャット情報
  const [chatsJsx, setChatsJsx] = useState([])
  const scrollBottomRef = useRef<HTMLDivElement>(null);  // useRef() : HTML の ref属性への参照
  const [message, setMessage] = useState("loading chats")

  // ページ読み込み時の副作用フック
  useEffect( () => {
    //console.log( "liveChatId : ", liveChatId )
    //console.log( "liveBroadcastContent : ", liveBroadcastContent )

    // useEffect 内で非同期処理の関数を定義
    const initPageAsync = async () => {
      // ライブチャット情報を取得
      if ( liveBroadcastContent === "live" && liveChatId !== undefined ) {
        let videoChatInfos_ = undefined
        let chatNumber_ = undefined
        try {
          [videoChatInfos_, chatNumber_, chatNextPageToken_] = await getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsChat, VideoWatchPageConfig.iterChat, chatNextPageToken_)
          console.log( "videoChatInfos_ : ", videoChatInfos_ )    
        }
        catch (err) {
          console.error(err);
          setMessage("チャットの取得に失敗しました")
        }

        videoChatInfos_.forEach((videoChatInfo_: any)=> {
          chatsJsx_.push(<>
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
        })
        const chatsJsx__ = chatsJsx_.slice();
        setChatsJsx(chatsJsx__)
        setMessage("")
      }
    }

    // 非同期処理実行
    initPageAsync()
  }, [])

  // setInterval() を呼び出す副作用フック。レンダーの度にsetIntervalが何度も実行されて、オーバーフローやメモリリークが発生するので副作用フック内で行う
  useEffect( () => {
    // 一定時間経過度に呼び出されるイベントハンドラ
    // setInterval(()=>{処理}, インターバル時間msec) : 一定時間度に {} で定義した処理を行う
    let timerChat = setInterval( ()=>{
      //console.log( "call timerChat" )

      // ライブチャット情報を取得
      if ( liveBroadcastContent === "live" && liveChatId !== undefined ) {
        //console.log( "chatNextPageToken_ : ", chatNextPageToken_ )
        getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsIntervalChat, 1, chatNextPageToken_ )
          .then( ([videoChatInfos_, chatNumber_, nextPageToken_ ]) => {
            console.log( "[timerChat] videoChatInfos_ : ", videoChatInfos_ )
            chatNextPageToken_ = nextPageToken_
            videoChatInfos_.forEach((videoChatInfo_: any)=> {
              chatsJsx_.push(<>
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
            })
            //console.log( "chatsJsx_ : ", chatsJsx_ )
            const chatsJsx__ = chatsJsx_.slice();
            setChatsJsx(chatsJsx__)

            // チャット表示を下にスクロール
            scrollBottomRef?.current?.scrollIntoView({behavior: "smooth", block: "end",});
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
  }, [])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      { /* チャット表示 */ }
      <Box style={{width: "400px"}} ml={2}>
        <Paper variant="outlined" square>
          <Box m={1}>
            <Typography variant="h6">{liveBroadcastContent !== "none" ? "チャット" : ""}</Typography>
          </Box>
        </Paper>
        <div className={style.chatTimeLineStyle} ref={scrollBottomRef}>
          <Paper elevation={1} variant="outlined" square>
            <Typography variant="h6">{message}</Typography>
            {liveBroadcastContent !== "none" ? chatsJsx : ""}
          </Paper>
        </div>
      </Box>
    </ThemeProvider>
  )
}

export default LiveChatList;

//{ /* ref={scrollBottomRef} で useRef() で作成した ref を <div> 設定する */ }
//<div ref={scrollBottomRef}></div>