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
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownAltOutlinedIcon from '@material-ui/icons/ThumbDownAltOutlined';
import ThumbDownAltRoundedIcon from '@material-ui/icons/ThumbDownAltRounded';

import firebase from "firebase";
import '../firebase/initFirebase'

import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import { getAPIKey, getVideoCommentInfos } from '../youtube_api/YouTubeDataAPI';

const convertCommentToJsx = (text: any) => {
  let textJsx: any = []
  if( text != undefined ) {
    // [正規表現] 
    // / : 正規表現の開始と終了
    // オプションフラグ g : グローバルサーチ。文字列全体に対してマッチングするか
    textJsx = text.split(/(<br>)/g).map((t:any) => (t === '<br>') ? <br/> : t)  // <br> を区切り文字として配列に分割し、分割した配列の \n を <br/> タグに変換する
  }
  //console.log( "textJsx : ", textJsx )
  return textJsx
}

//-----------------------------------------------
// 動画コメントを表示するコンポーネント
//-----------------------------------------------
// コンポーネントの引数
type Props = {
  videoId: any;
  liveBroadcastContent: string;
}

const CommentList: React.FC<Props> = ({ 
  children,
  videoId,
  liveBroadcastContent,
}) => {
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // 動画コメント情報
  const [commentsNumber, setCommentsNumber] = useState()
  const [commentsJsx, setCommentsJsx] = useState([])
  const [message, setMessage] = useState("loading comments")

  // ページ読み込み時の副作用フック
  useEffect( () => {
    //console.log( "liveChatId : ", liveChatId )
    //console.log( "liveBroadcastContent : ", liveBroadcastContent )

    // useEffect 内で非同期処理の関数を定義
    const initPageAsync = async () => {
      // 動画コメント情報を取得
      if ( liveBroadcastContent === undefined || liveBroadcastContent === "none" ) {
        let videoCommentInfos_: any = []
        let commentsNumber_: any = undefined
        let commentsJsx_: any = []

        try {
          [videoCommentInfos_, commentsNumber_] = await getVideoCommentInfos(getAPIKey(), videoId, VideoWatchPageConfig.maxResultsComment, VideoWatchPageConfig.iterComment)
          setCommentsNumber(commentsNumber_)
          console.log( "videoCommentInfos_ : ", videoCommentInfos_ )    
        }
        catch (err) {
          console.error(err);
          setMessage("コメントの取得に失敗しました")
        }
  
        videoCommentInfos_.forEach((videoCommentInfo_: any)=> {
          commentsJsx_.push(<>
            <ListItem alignItems="flex-start">
              { /* アイコン画像 */ }
              <ListItemAvatar>
                <Link href={videoCommentInfo_["authorChannelUrl"]}><Avatar aria-label="avatar" src={videoCommentInfo_["authorProfileImageUrl"]} style={{ width: 60, height: 60 }} /></Link>
              </ListItemAvatar>
              <ListItemText 
                primary={<>
                  <Box mx={1} style={{display:"flex"}}>
                    { /* ユーザー名 */ }
                    <Typography component="span" variant="body2" color="textPrimary" style={{display: "inline"}}>{videoCommentInfo_["authorDisplayName"]}</Typography>
                    { /* コメント投稿日 */ }
                    <Box mx={2} style={{display:"flex"}}>
                      <Typography component="span" variant="body2" color="textSecondary" style={{display: "inline"}}>{videoCommentInfo_["publishedAt"]}</Typography>
                    </Box>
                  </Box>
                </>}
                secondary={<>
                  <Box mx={2}>
                    { /* コメント */ }
                    <Typography variant="subtitle2">{convertCommentToJsx(videoCommentInfo_["textDisplay"])}</Typography>
                    <Box mt={1} style={{display:"flex"}}>
                      { /* いいね数 */ }
                      <Box mx={0} style={{display:"flex"}}>
                        <ThumbUpOutlinedIcon />
                      </Box>
                      <Box mx={1} style={{display:"flex"}}>
                        <Typography variant="subtitle2">{videoCommentInfo_["likeCount"]}</Typography>
                      </Box>
                      { /* 返信 */ }
                      <Box mx={1} style={{display:"flex"}}>
                        <Typography variant="subtitle2">返信</Typography>
                      </Box>
                    </Box>
                  </Box>
                </>}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </>)
        })
        const commentsJsx__ = commentsJsx_.slice();
        setCommentsJsx(commentsJsx__)
        setMessage("")
      }
    }

    // 非同期処理実行
    initPageAsync()
  }, [])

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      { /* 動画コメント */ }   
      <Typography>{message}</Typography>       
      <Divider />
      <Box mt={2} mx={2}>
        <Typography variant="subtitle1" display="inline" style={{whiteSpace: 'pre-line'}}>{liveBroadcastContent === "none" ? commentsNumber + " 件のコメント" : ""}</Typography>
      </Box>
      <List component="div">
        {liveBroadcastContent === "none" ? commentsJsx : ""}
      </List>
    </ThemeProvider>
  )
}

export default CommentList;
