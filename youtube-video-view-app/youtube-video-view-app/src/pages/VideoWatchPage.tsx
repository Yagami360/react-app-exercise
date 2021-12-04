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

import AppConfig, { VideoWatchPageConfig, YouTubeDataAPIConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'

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
  let textJsx = ""
  if( text != undefined ) {
   //text = text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, <a href='$1'>'$1'</a>)
    textJsx = text.split(/(\n)/g).map((t:any) => (t === '\n') ? <br/> : t)  // 改行文字 \n を <br> タグに変換
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
  const videoURL = 'https://www.youtube.com/embed/' + videoId;
  //console.log( "videoURL : ", videoURL )
  //console.log( "location : ", location )
  //console.log( "params : ", params )
  //console.log( "videoId : ", videoId )
  //console.log( "videoURL : ", videoURL )

  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // 独自スタイル
  const style = useStyles()

  // 動画情報
  const [title, setTitle] = useState()
  const [description, setDescription] = useState()
  const [publishedAt, setPublishedAt] = useState()
  const [tags, setTags] = useState([])
  const [viewCount, setViewCount] = useState()
  const [likeCount, setLikeCount] = useState()
  const [dislikeCount, setDislikeCount] = useState()
  const [favoriteCount, setFavoriteCount] = useState()
  const [categoryId, setCategoryId] = useState()  
  const [categoryTitle, setCategoryTitle] = useState()
  const [guideCategoryTitle, setGuideCategoryTitle] = useState()

  // チャンネル情報
  const [channelId, setChannelId] = useState()
  const [channelTitle, setChannelTitle] = useState()
  const [subscriberCount, setSubscriberCount] = useState()
  const [profileImageUrl, setProfileImageUrl] = useState()

  // 動画コメント情報
  const [commentsNumber, setCommentsNumber] = useState()
  const [commentsJsx, setCommentsJsx] = useState([])
  
  // チャット情報
  const [liveBroadcastContent, setLiveBroadcastContent] = useState()
  const [concurrentViewers, setConcurrentViewers] = useState()
  const [liveChatId, setLiveChatId] = useState()
  const [chatsJsx, setChatsJsx] = useState([])

  // 動画情報を取得する副作用フック
  useEffect(() => {
    // YouTube Data API を使用して動画情報を取得
    fetch(YouTubeDataAPIConfig.url+"videos" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet,statistics,liveStreamingDetails,topicDetails' + '&id='+videoId )
      .then( (response) => {
        if ( !response.ok) {
          throw new Error();
        }
        return response.json()
      })
      .then((dataVideos) => {
        if( dataVideos["items"] == undefined ) {
          //throw new Error();
          return
        }
        dataVideos["items"].forEach((itemVideo: any)=> {
          console.log("itemVideo : ", itemVideo)

          // チャンネル情報を設定
          setChannelId(itemVideo["snippet"]["channelId"])
          setChannelTitle(itemVideo["snippet"]["channelTitle"])

          // 動画情報を設定
          setTitle(itemVideo["snippet"]["title"])
          setPublishedAt(itemVideo["snippet"]["publishedAt"])
          setDescription(itemVideo["snippet"]["description"])
          setCategoryId(itemVideo["snippet"]["categoryId"])
          setTags(itemVideo["snippet"]["tags"])
          setViewCount(itemVideo["statistics"]["viewCount"])
          setLikeCount(itemVideo["statistics"]["likeCount"])
          setDislikeCount(itemVideo["statistics"]["dislikeCount"])
          setFavoriteCount(itemVideo["statistics"]["favoriteCount"])

          // チャット情報を取得
          setLiveBroadcastContent(itemVideo["snippet"]["liveBroadcastContent"])
          setConcurrentViewers(itemVideo["liveStreamingDetails"]["concurrentViewers"])
          setLiveChatId(itemVideo["liveStreamingDetails"]["activeLiveChatId"])
        })

        // YouTube Data API を使用してチャンネル情報を取得
        fetch(YouTubeDataAPIConfig.url+"channels" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet,statistics' + '&id='+channelId )
          .then( (response) => {
            if ( !response.ok) {
              throw new Error();
            }
            return response.json()
          })
          .then((dataChannels) => {
            //console.log("dataChannels : ", dataChannels)
            if( dataChannels["items"] == undefined ) {
              //throw new Error();
              return
            }
            dataChannels["items"].forEach((itemChannel: any)=> {
              console.log("itemChannel : ", itemChannel)
              setProfileImageUrl(itemChannel["snippet"]["thumbnails"]["medium"]["url"])
              setSubscriberCount(itemChannel["statistics"]["subscriberCount"])
            })
          })

        // YouTube Data API を使用して動画カテゴリ情報を取得
        fetch(YouTubeDataAPIConfig.url+"videoCategories" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet' + '&id='+categoryId )
          .then( (response) => {
            if ( !response.ok) {
              throw new Error();
            }
            return response.json()
          })
          .then((dataVideoCategories) => {
            //console.log("dataVideoCategories : ", dataVideoCategories)
            if( dataVideoCategories["items"] == undefined ) {
              //throw new Error();
              return
            }
            let categoryTitle_: any = []
            dataVideoCategories["items"].forEach((itemVideoCategorie: any)=> {
              console.log("itemVideoCategorie : ", itemVideoCategorie)
              categoryTitle_.push(itemVideoCategorie["snippet"]["title"])
            })
            setCategoryTitle(categoryTitle_)
          })

        /*
        // YouTube Data API を使用してガイドカテゴリ情報（YouTube によって自動割り振りされた動画カテゴリ）を取得
        fetch(YouTubeDataAPIConfig.url+"guideCategories" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet' + '&regionCode=jp' + '&id='+categoryId )
          .then( (response) => {
            if ( !response.ok) {
              throw new Error();
            }
            return response.json()
          })
          .then((dataGuideCategories) => {
            //console.log("dataGuideCategories : ", dataGuideCategories)
            if( dataGuideCategories["items"] == undefined ) {
              //throw new Error();
              return
            }
            let guideCategoryTitle_: any = []
            dataGuideCategories["items"].forEach((itemGuideCategorie: any)=> {
              console.log("itemGuideCategorie : ", itemGuideCategorie)
              guideCategoryTitle_.push(itemGuideCategorie["snippet"]["title"])
            })
            setGuideCategoryTitle(guideCategoryTitle_)
          })
        */

        // YouTube Data API を使用してコメント情報を取得
        if ( liveBroadcastContent === undefined ) {
          fetch(YouTubeDataAPIConfig.url+"commentThreads" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet,replies' + '&videoId='+videoId + '&maxResults=100' )
            .then( (response) => {
              if ( !response.ok) {
                //throw new Error();
              }
              return response.json()
            })
            .then((dataCommentThreads) => {
              console.log("dataCommentThreads : ", dataCommentThreads)
              if( dataCommentThreads["items"] == undefined ) {
                //throw new Error();
                return
              }
              setCommentsNumber(dataCommentThreads["pageInfo"]["totalResults"])
              let commentsJsx_: any = []
              dataCommentThreads["items"].forEach((itemCommentThread: any)=> {
                const commentId = itemCommentThread["id"]
                const commentText = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                const commentPublishedAt = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["publishedAt"]
                const commentLikeCount = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["likeCount"]

                const commentAuthorDisplayName = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorDisplayName"]
                const commentAuthorProfileImageUrl = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorProfileImageUrl"]
                const commentAuthorChannelId = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorChannelId"]
                const commentAuthorChannelUrl = itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorChannelUrl"]

                commentsJsx_.push(
                  <ListItem>
                    <Box style={{display:"flex"}}>
                      { /* アイコン画像 */ }
                      <Link href={commentAuthorChannelUrl}><Avatar aria-label="avatar" src={commentAuthorProfileImageUrl} style={{ width: 60, height: 60 }} /></Link>
                      <Box mx={2}>
                        <Box style={{display:"flex"}}>
                          { /* ユーザー名 */ }
                          <Typography variant="subtitle1">{commentAuthorDisplayName}</Typography>
                          { /* コメント投稿日 */ }
                          <Box mx={2}>
                            <Typography variant="subtitle2">{commentPublishedAt}</Typography>
                          </Box>
                        </Box>
                        { /* コメント */ }
                        <Typography variant="subtitle2">{commentText}</Typography>
                        { /* いいね数 */ }
                        <Box style={{display:"flex"}} mt={1}>
                          <ThumbUpOutlinedIcon />
                          <Box mx={1}>
                            <Typography variant="subtitle2">{commentLikeCount}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                )
              })
              setCommentsJsx(commentsJsx_)
            })        
        }

        // YouTube Live Streaming API を使用してチャット情報を取得
        console.log( "liveBroadcastContent : ", liveBroadcastContent )
        console.log( "liveChatId : ", liveChatId )
        if ( liveBroadcastContent !== undefined && liveChatId !== undefined ) {
          fetch(YouTubeDataAPIConfig.url+"liveChat/messages" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=id,snippet,authorDetails' + '&liveChatId='+liveChatId + '&maxResults=2000')
            .then( (response) => {
              if ( !response.ok) {
                console.log("response : ", response)
                //throw new Error();
              }
              return response.json()
            })
            .then((dataLiveChatMessages) => {
              console.log("dataLiveChatMessages : ", dataLiveChatMessages)
              if( dataLiveChatMessages["items"] == undefined ) {
                return
              }
              let chatsJsx_: any = []
              dataLiveChatMessages["items"].forEach((itemLiveChatMessage: any)=> {
                const chatDisplayName = itemLiveChatMessage["authorDetails"]["displayName"]
                const chatChannelId = itemLiveChatMessage["authorDetails"]["channelId"]
                const chatChannelUrl = itemLiveChatMessage["authorDetails"]["channelUrl"]
                const chatProfileImageUrl = itemLiveChatMessage["authorDetails"]["profileImageUrl"]
                const chatPublishedAt = itemLiveChatMessage["snippet"]["publishedAt"]
                const chatMessageText = itemLiveChatMessage["snippet"]["textMessageDetails"]["messageText"]

                chatsJsx_.push(
                  <ListItem>
                    <Box style={{display:"flex"}}>
                      { /* アイコン画像 */ }
                      <Link href={chatProfileImageUrl}><Avatar aria-label="avatar" src={chatProfileImageUrl} style={{ width: 60, height: 60 }} /></Link>
                      <Box mx={2}>
                        <Box style={{display:"flex"}}>
                          { /* ユーザー名 */ }
                          <Typography variant="subtitle1">{chatDisplayName}</Typography>
                          { /* コメント投稿日 */ }
                          <Box mx={2}>
                            <Typography variant="subtitle2">{chatPublishedAt}</Typography>
                          </Box>
                        </Box>
                        { /* コメント */ }
                        <Typography variant="subtitle2">{chatMessageText}</Typography>
                      </Box>
                    </Box>
                  </ListItem>
                )
              })
              setChatsJsx(chatsJsx_)
            })
        }

      })
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
        { /* 動画表示 */ }
        <iframe id="ytplayer" data-type="text/html" width={VideoWatchPageConfig.videoWidth} height={VideoWatchPageConfig.videoHeight} src={videoURL} frameBorder="0"></iframe>  { /* IFrame Player API では、<iframe> タグで動画プレイヤーを埋め込むことで動画再生できるようになる。<iframe> は、HTML の標準機能でインラインフレーム要素を表す */ }
        { /* チャット表示 */ }
        <Box m={2}>
          {liveBroadcastContent !== "none" ? chatsJsx : ""}
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
            <Typography variant="subtitle1">{liveBroadcastContent === "none" ? commentsNumber + " 件のコメント" : ""}</Typography>
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
