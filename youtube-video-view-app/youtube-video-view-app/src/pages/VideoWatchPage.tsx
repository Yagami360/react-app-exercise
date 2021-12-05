/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'
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

import AppConfig, { VideoWatchPageConfig, YouTubeDataAPIConfig } from '../Config'
import AppTheme from '../components/Theme';
import Header from '../components/Header'
import useLocalPersist from '../components/LocalPersist';
import { getChannelIdFromVideoId, getChannelInfo, getVideoInfo, getVideoCategoryInfo, getVideoCommentInfos, getVideoChatInfos } from '../youtube_api/YouTubeDataAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// 独自のスタイル定義
const useStyles = makeStyles({
  // 各ユーザーのタイムラインのスタイル
  videoInfoStatistics: {
    display: "flex",          // 横に配置
  },
})

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
  const location = useLocation();   // URL path や パラメータなど
  const params = useParams();       // パスパラメーター取得
  const videoId = params["video_id"]
  const videoURL = 'https://www.youtube.com/embed/' + videoId + '?autoplay='+VideoWatchPageConfig.autoPlay;
  //console.log( "location : ", location )
  //console.log( "params : ", params )
  console.log( "videoId : ", videoId )
  console.log( "videoURL : ", videoURL )

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // 独自スタイル
  const style = useStyles()

  // 処理結果メッセージ
  const [messageVideo, setMessageVideo] = useState("")
  const [messageChannel, setMessageChannel] = useState("")
  const [messageVideoCategory, setMessageVideoCategory] = useState("")
  const [messageComment, setMessageComment] = useState("")
  const [messageChat, setMessageChat] = useState("")

  // チャンネル情報
  const [channelId, setChannelId] = useState()
  const [channelTitle, setChannelTitle] = useState()
  const [subscriberCount, setSubscriberCount] = useState()
  const [profileImageUrl, setProfileImageUrl] = useState()

  // 動画情報
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

  // 動画コメント情報
  const [commentsNumber, setCommentsNumber] = useState()
  const [commentsJsx, setCommentsJsx] = useState([])
  
  // チャット情報
  const [liveBroadcastContent, setLiveBroadcastContent] = useState()
  const [concurrentViewers, setConcurrentViewers] = useState()
  const [liveChatId, setLiveChatId] = useState()
  const [chatsJsx, setChatsJsx] = useState([])

  // ページ読み込み時の副作用フック
  useEffect(() => {
    // useEffect 内で非同期処理
    (async () => {
      let channelId_ = undefined
      let channelInfo_ = undefined
      let videoInfo_ = undefined
      let categoryId_ = undefined
      let videoCategoryInfo_ = undefined
      let videoCommentInfos_ = []
      let liveBroadcastContent_ = undefined
      let liveChatId_ = undefined
      let commentsNumber_ = undefined
      let videoChatInfos_ = []
      let chatNumber_ = undefined

      // 動画ID からチャンネルIDを取得
      try {
        channelId_ = await getChannelIdFromVideoId(YouTubeDataAPIConfig.apiKey, videoId)
        console.log( "channelId_ : ", channelId_ )    
        setChannelId(channelId_)
      }
      catch (err) {
        console.error(err);
      }      

      // チャンネル情報を取得
      try {
        channelInfo_ = await getChannelInfo(YouTubeDataAPIConfig.apiKey, channelId_)
        console.log( "channelInfo_ : ", channelInfo_ )    
        setChannelTitle(channelInfo_["title"])
        setSubscriberCount(channelInfo_["subscriberCount"])
        setProfileImageUrl(channelInfo_["profileImageUrl"])
      }
      catch (err) {
        console.error(err);
      }

      // 動画情報を取得
      try {
        videoInfo_ = await getVideoInfo(YouTubeDataAPIConfig.apiKey, videoId)
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

        liveBroadcastContent_ = videoInfo_["liveBroadcastContent"]
        liveChatId_ = videoInfo_["activeLiveChatId"]
        setLiveBroadcastContent(videoInfo_["liveBroadcastContent"])
        setLiveChatId(videoInfo_["activeLiveChatId"])
        setConcurrentViewers(videoInfo_["concurrentViewers"])
      }
      catch (err) {
        console.error(err);
      }

      // 動画カテゴリ情報を取得
      try {
        videoCategoryInfo_ = await getVideoCategoryInfo(YouTubeDataAPIConfig.apiKey, categoryId_)
        console.log( "videoCategoryInfo_ : ", videoCategoryInfo_ )    
        setCategoryTitle(videoCategoryInfo_["title"])
      }
      catch (err) {
        console.error(err);
      }

      // 動画コメント情報を取得
      if ( liveBroadcastContent_ === undefined || liveBroadcastContent_ === "none" ) {
        try {
          [videoCommentInfos_, commentsNumber_] = await getVideoCommentInfos(YouTubeDataAPIConfig.apiKey, videoId, VideoWatchPageConfig.maxResultsComment, VideoWatchPageConfig.iterComment)
          setCommentsNumber(commentsNumber_)
          console.log( "videoCommentInfos_ : ", videoCommentInfos_ )    
        }
        catch (err) {
          console.error(err);
        }
  
        let commentsJsx_: any = []
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
        setCommentsJsx(commentsJsx_)
      }

      // ライブチャット情報を取得
      if ( liveBroadcastContent_ === "live" && liveChatId_ !== undefined ) {
        try {
          [videoChatInfos_, chatNumber_] = await getVideoChatInfos(YouTubeDataAPIConfig.apiKey, liveChatId_, VideoWatchPageConfig.maxResultsChat, VideoWatchPageConfig.iterChat)
          console.log( "videoChatInfos_ : ", videoChatInfos_ )    
        }
        catch (err) {
          console.error(err);
        }

        let chatsJsx_: any = []
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
        setChatsJsx(chatsJsx_)
      }

    })()
  }, [] )

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
        <Grid container spacing={0}>
          { /* 動画表示 */ }
          <Typography variant="subtitle2">{messageVideo}</Typography>
          <Grid item xs={9}>
            <iframe id="ytplayer" data-type="text/html" width={VideoWatchPageConfig.videoWidth} height={VideoWatchPageConfig.videoHeight} src={videoURL} frameBorder="0"></iframe>  { /* IFrame Player API では、<iframe> タグで動画プレイヤーを埋め込むことで動画再生できるようになる。<iframe> は、HTML の標準機能でインラインフレーム要素を表す */ }
          </Grid>
          { /* チャット表示 */ }
          <Typography variant="subtitle2">{messageChat}</Typography>
          <Grid item xs={3}>
            {liveBroadcastContent !== "none" ? chatsJsx : ""}
          </Grid>
        </Grid>
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
          { /* コメント */ }          
          <Divider />
          <Box mt={2} mx={2}>
            <Typography variant="subtitle1" display="inline" style={{whiteSpace: 'pre-line'}}>{liveBroadcastContent === "none" ? commentsNumber + " 件のコメント" : ""}</Typography>
          </Box>
          <List component="div">
            {liveBroadcastContent === "none" ? commentsJsx : ""}
          </List>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default VideoWatchPage;
