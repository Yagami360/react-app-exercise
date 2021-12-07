/* eslint-disable */
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom';

import firebase from "firebase";
import '../firebase/initFirebase'

import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import PlayCircleOutlineRoundedIcon from '@material-ui/icons/PlayCircleOutlineRounded';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownAltOutlinedIcon from '@material-ui/icons/ThumbDownAltOutlined';
import ThumbDownAltRoundedIcon from '@material-ui/icons/ThumbDownAltRounded';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import Avatar from '@material-ui/core/Avatar'
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Paper from '@material-ui/core/Paper';

import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import Header from '../components/Header'
import CommentList from '../components/CommentList'
import LiveChatList from '../components/LiveChatList'
import useLocalPersist from '../components/LocalPersist';
import { getAPIKey, getChannelIdFromVideoId, getChannelInfo, getVideoInfo, getVideoCategoryInfo, getVideoCommentInfos, getVideoChatInfos } from '../youtube_api/YouTubeDataAPI';

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

const convertTagsToJsx = (tags: any) => {
  let tagsJsx = ""
  if( tags != undefined ) {
    tags.forEach((tag: any)=> {
      tagsJsx += "#" + tag + " "
    })
  }
  return tagsJsx
}

// 動画視聴ページを表示するコンポーネント
const VideoWatchPage: React.VFC = () => {
  //------------------------
  // パスパラメーター
  //------------------------
  const params_ = useParams();       // パスパラメーター取得
  const videoId_ = params_["video_id"]
  const videoURL_ = 'https://www.youtube.com/embed/' + videoId_ + '?autoplay='+VideoWatchPageConfig.autoPlay;
  //console.log( "location : ", location )
  //console.log( "params : ", params )

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // 処理結果メッセージ
  const [messageVideo, setMessageVideo] = useState("")
  const [messageChannel, setMessageChannel] = useState("")
  const [messageVideoCategory, setMessageVideoCategory] = useState("")

  // チャンネル情報
  const [channelId, setChannelId] = useState()
  const [channelTitle, setChannelTitle] = useState()
  const [subscriberCount, setSubscriberCount] = useState()
  const [profileImageUrl, setProfileImageUrl] = useState()

  // 動画情報
  const [videoId, setVideoId] = useState(videoId_)
  const [title, setTitle] = useState()
  const [description, setDescription] = useState()
  const [publishedAt, setPublishedAt] = useState()
  const [tags, setTags] = useState([])
  const [viewCount, setViewCount] = useState()
  const [likeCount, setLikeCount] = useState()
  const [dislikeCount, setDislikeCount] = useState()
  const [favoriteCount, setFavoriteCount] = useState()

  // 動画カテゴリ情報
  const [categoryId, setCategoryId] = useState()  
  const [categoryTitle, setCategoryTitle] = useState()
  const [guideCategoryTitle, setGuideCategoryTitle] = useState()
  
  // チャット情報
  const [liveChatId, setLiveChatId] = useState("")
  const [liveBroadcastContent, setLiveBroadcastContent] = useState("")
  const [concurrentViewers, setConcurrentViewers] = useState()

  // ページ読み込み時の副作用フック
  useEffect( () => {
    //console.log( "call useEffect1" )

    // useEffect 内で非同期処理の関数を定義
    const initPageAsync = async () => {
      console.log( "call async" )

      // 動画ID からチャンネルIDを取得
      let channelId_: any = undefined
      try {
        channelId_ = await getChannelIdFromVideoId(getAPIKey(), videoId)
        console.log( "channelId_ : ", channelId_ )    
        setChannelId(channelId_)
      }
      catch (err) {
        console.error(err);
      }      

      // チャンネル情報を取得
      let channelInfo_: any = undefined
      try {
        channelInfo_ = await getChannelInfo(getAPIKey(), channelId_)
        console.log( "channelInfo_ : ", channelInfo_ )    
        setChannelTitle(channelInfo_["title"])
        setSubscriberCount(channelInfo_["subscriberCount"])
        setProfileImageUrl(channelInfo_["profileImageUrl"])
      }
      catch (err) {
        console.error(err);
      }

      // 動画情報を取得
      let videoInfo_: any = undefined
      let categoryId_: any = undefined
      let liveChatId_: any = undefined
      let liveBroadcastContent_: any = undefined
      try {
        videoInfo_ = await getVideoInfo(getAPIKey(), videoId)
        console.log( "videoInfo_ : ", videoInfo_ )    
        setTitle(videoInfo_["title"])
        setDescription(videoInfo_["description"])
        setPublishedAt(videoInfo_["publishedAt"])
        setTags(videoInfo_["tags"])
        setViewCount(videoInfo_["viewCount"])
        setLikeCount(videoInfo_["likeCount"])
        setDislikeCount(videoInfo_["dislikeCount"])
        setFavoriteCount(videoInfo_["favoriteCount"])

        categoryId_ = videoInfo_["categoryId"]
        setCategoryId(videoInfo_["categoryId"])

        liveChatId_ = videoInfo_["activeLiveChatId"]
        setLiveChatId(videoInfo_["activeLiveChatId"])

        liveBroadcastContent_ = videoInfo_["liveBroadcastContent"]        
        setLiveBroadcastContent(videoInfo_["liveBroadcastContent"])

        setConcurrentViewers(videoInfo_["concurrentViewers"])
      }
      catch (err) {
        console.error(err);
      }

      // 動画カテゴリ情報を取得
      try {
        const videoCategoryInfo_ = await getVideoCategoryInfo(getAPIKey(), categoryId_)
        console.log( "videoCategoryInfo_ : ", videoCategoryInfo_ )    
        setCategoryTitle(videoCategoryInfo_["title"])
      }
      catch (err) {
        console.error(err);
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
  const channelURL = "https://www.youtube.com/channel/" + channelId
  const youtubeVideoURL = "https://www.youtube.com/watch?v=" + videoId

  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.videoWatchPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* ボディ入力 */}
      <Box m={2}>
        <Typography variant="subtitle2">{messageVideo}</Typography>
        <Box style={{display: "flex"}}>
          { /* 動画表示 */ }
          <iframe id="ytplayer" data-type="text/html" width={VideoWatchPageConfig.videoWidth} height={VideoWatchPageConfig.videoHeight} src={videoURL_} frameBorder="0"></iframe>  { /* IFrame Player API では、<iframe> タグで動画プレイヤーを埋め込むことで動画再生できるようになる。<iframe> は、HTML の標準機能でインラインフレーム要素を表す */ }
          { /* チャット表示 */ }
          <LiveChatList liveChatId={liveChatId} liveBroadcastContent={liveBroadcastContent} />
        </Box>
        { /* 動画情報表示 */ }
        <Box m={2}>
          { /* 動画タイトル */ }
          <Typography variant="h6">{convertDescriptionToJsx(title)}</Typography>
          <Box style={{display:"flex"}} m={1}>
            { /* 現在視聴者 */ }
            <Box style={{display:"flex"}} mx={1}>
              <Typography variant="subtitle1">{liveBroadcastContent !== "none" ? concurrentViewers+" 人視聴中" : ""}</Typography>
            </Box>
            { /* 再生回数 */ }
            <PlayCircleOutlineRoundedIcon />
            <Box style={{display:"flex"}} mx={1}>
              <Typography variant="subtitle1">{viewCount}</Typography>
            </Box>
            { /* 高評価 */ }
            <ThumbUpOutlinedIcon />
            <Box style={{display:"flex"}} mx={1}>
              <Typography variant="subtitle1">{likeCount}</Typography>
            </Box>
            { /* 低評価 */ }
            <ThumbDownAltOutlinedIcon />
            <Box style={{display:"flex"}} mx={1}>
              <Typography variant="subtitle1">{dislikeCount}</Typography>
            </Box>
            { /* お気に入り数 */ }
            <FavoriteBorderOutlinedIcon />
            <Box style={{display:"flex"}} mx={1}>
              <Typography variant="subtitle1">{favoriteCount}</Typography>
            </Box>
            { /* 動画日時 */ }
            <Box style={{display:"flex"}} mx={1}>
              <Typography variant="subtitle1">{publishedAt}</Typography>
            </Box>
          </Box>
          <Divider />
          { /* チャンネル情報 */ }
          <Typography variant="subtitle2">{messageChannel}</Typography>
          <Box m={2} style={{display:"flex"}}>
            <Link href={channelURL}><Avatar aria-label="avatar" src={profileImageUrl} style={{ width: 80, height: 80 }} /></Link>
            <Box mx={2}>
              <Link href={channelURL}><Typography variant="h5">{channelTitle}</Typography></Link>
              <Typography variant="subtitle1">{"登録者数 : "+subscriberCount+" 人"}</Typography>
            </Box>
          </Box>
          { /* 動画説明 */ }
          <Box m={2}>
            <Typography variant="body1">{convertDescriptionToJsx(description)}</Typography>
          </Box>
          { /* 追加情報 */ }
          <Divider />
          <List component="div">
            { /* 動画カテゴリ */ }
            <Typography variant="subtitle2">{messageVideoCategory}</Typography>
            <ListItem>
              <ListItemText primary={"動画カテゴリ : " + categoryTitle} />
            </ListItem>
            { /* ガイドカテゴリ */ }
            <ListItem>
              <ListItemText primary={"ガイドカテゴリ : " + guideCategoryTitle} />
            </ListItem>
            { /* タグ */ }
            <ListItem>
              <ListItemText primary={"タグ : " + convertTagsToJsx(tags)} />
            </ListItem>
          </List>
        </Box>
        { /* 動画コメント */ }
        <Box m={2}>
          <CommentList videoId={videoId} liveBroadcastContent={liveBroadcastContent} />
        </Box>          
      </Box>
    </ThemeProvider>
  );
}

export default VideoWatchPage;
