/* eslint-disable */
// React
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useLocation, Navigate } from 'react-router-dom';

// Material-UI
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

// firebase
import firebase from "firebase";
import '../firebase/initFirebase'

// 自作モジュール
import AppConfig, { VideoWatchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import Header from '../components/Header'
import SimpleVideoPlayer from '../components/SimpleVideoPlayer'
import VideoPlayer from '../components/VideoPlayer'
import CommentList from '../components/CommentList'
import LiveChatList from '../components/LiveChatList'
import useLocalPersist from '../components/LocalPersist';
import { getAPIKey, getChannelIdFromVideoId, getChannelInfo, getVideoInfo, getVideoCategoryInfo, getGuideCategoryInfo, getVideoChatInfos } from '../youtube_api/YouTubeDataAPI';

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

//=======================================
// 動画視聴ページを表示するコンポーネント
//=======================================
const VideoWatchPage: React.VFC = () => {
  //------------------------
  // パスパラメーター
  //------------------------
  const params_ = useParams();       // パスパラメーター取得
  const videoId_ = params_["video_id"]
  const videoURL_ = 'https://www.youtube.com/embed/' + videoId_ + '?autoplay='+VideoWatchPageConfig.autoPlay;
  //console.log( "location : ", location )
  //console.log( "params : ", params )
  //console.log( "videoId_ : ", videoId_)
  
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", true)

  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

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
  const [descriptionJsx, setDescriptionJsx] = useState([])
  const [publishedAt, setPublishedAt] = useState()
  const [tags, setTags] = useState([])
  const [viewCount, setViewCount] = useState()
  const [likeCount, setLikeCount] = useState()
  const [dislikeCount, setDislikeCount] = useState()
  const [favoriteCount, setFavoriteCount] = useState()
  const [showMore, setShowMore] = useState(false)
  const scrollShowMoreRef = useRef<HTMLDivElement>(null);  // useRef() : HTML の ref属性への参照

  // 動画カテゴリ情報
  const [categoryId, setCategoryId] = useState()  
  const [categoryTitle, setCategoryTitle] = useState()
  const [guideCategoryTitle, setGuideCategoryTitle] = useState()

  // チャット情報
  const [liveChatId, setLiveChatId] = useState("")
  const [liveBroadcastContent, setLiveBroadcastContent] = useState("")
  const [concurrentViewers, setConcurrentViewers] = useState()
  const [videoChatInfos, setVideoChatInfos] = useState([] as any)
  let chatNextPageTokenRef = React.useRef<string>("");
  let videoChatInfosRef = React.useRef<any>([]);

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
  useEffect( () => {
    //console.log( "call useEffect1" )

    // useEffect 内で非同期処理の関数を定義
    const initPageAsync = async () => {
      //console.log( "call async" )

      // 動画ID からチャンネルIDを取得
      let channelId_: any = undefined
      try {
        channelId_ = await getChannelIdFromVideoId(getAPIKey(), videoId)
        //console.log( "channelId_ : ", channelId_ )    
        setChannelId(channelId_)
      }
      catch (err) {
        console.error(err);
      }      

      // チャンネル情報を取得
      let channelInfo_: any = undefined
      try {
        channelInfo_ = await getChannelInfo(getAPIKey(), channelId_)
        //console.log( "channelInfo_ : ", channelInfo_ )    
        setChannelTitle(channelInfo_["title"])
        setSubscriberCount(channelInfo_["subscriberCount"])
        setProfileImageUrl(channelInfo_["profileImageUrl"])
        setMessageChannel("")
      }
      catch (err) {
        console.error(err);
        setMessageChannel("チャンネル情報の取得に失敗しました")
      }

      // 動画情報を取得
      let videoInfo_: any = undefined
      let categoryId_: any = undefined
      let liveChatId_: any = undefined
      let liveBroadcastContent_: any = undefined
      try {
        videoInfo_ = await getVideoInfo(getAPIKey(), videoId)
        //console.log( "videoInfo_ : ", videoInfo_ )    
        setTitle(videoInfo_["title"])
        setDescription(videoInfo_["description"])
        setDescriptionJsx(convertDescriptionToJsx(videoInfo_["description"]))
        setPublishedAt(videoInfo_["publishedAt"])
        setTags(videoInfo_["tags"])
        setViewCount(videoInfo_["viewCount"])
        setLikeCount(videoInfo_["likeCount"])
        setDislikeCount(videoInfo_["dislikeCount"])
        setFavoriteCount(videoInfo_["favoriteCount"])

        categoryId_ = videoInfo_["categoryId"]
        setCategoryId(videoInfo_["categoryId"])

        liveChatId_ = videoInfo_["activeLiveChatId"]
        setLiveChatId(liveChatId_)

        liveBroadcastContent_ = videoInfo_["liveBroadcastContent"]   
        setLiveBroadcastContent(liveBroadcastContent_)

        setConcurrentViewers(videoInfo_["concurrentViewers"])
        setMessageVideo("")
      }
      catch (err) {
        console.error(err);
        setMessageVideo("動画情報の取得に失敗しました")
      }

      // 動画カテゴリ情報を取得
      try {
        const videoCategoryInfo_ = await getVideoCategoryInfo(getAPIKey(), categoryId_)
        //console.log( "[VideoWatchPage (initPageAsync)] videoCategoryInfo_ : ", videoCategoryInfo_ )    
        setCategoryTitle(videoCategoryInfo_["title"])
        setMessageVideoCategory("")
      }
      catch (err) {
        console.error(err);
        setMessageVideoCategory("動画カテゴリ情報の取得に失敗しました")
      }

      // ガイドカテゴリ情報を修正
      /*
      try {
        const guideCategoryInfo_ = await getGuideCategoryInfo(getAPIKey())
        //console.log( "guideCategoryInfo_ : ", guideCategoryInfo_ )    
        setGuideCategoryTitle(guideCategoryInfo_["title"])
        setMessageVideoCategory("")
      }
      catch (err) {
        console.error(err);
        setMessageVideoCategory("ガイドカテゴリ情報の取得に失敗しました")
      }
      */

      // ライブチャット情報を取得
      if ( liveBroadcastContent_ === "live" || liveBroadcastContent_ === "upcoming" ) {
        let chatNumber_ = undefined
        let videoChatInfos_ = undefined
        try {
          [videoChatInfos_, chatNumber_, chatNextPageTokenRef.current] = await getVideoChatInfos(getAPIKey(), liveChatId_, VideoWatchPageConfig.maxResultsChat, VideoWatchPageConfig.iterChat, chatNextPageTokenRef.current)
          videoChatInfos_.forEach((videoChatInfo_: any)=> {
            videoChatInfosRef.current.push(videoChatInfo_)
          })
          setVideoChatInfos([...videoChatInfos, ...videoChatInfosRef.current])
        }
        catch (err) {
          console.error(err);
        }
      }
    }

    // 非同期処理実行
    initPageAsync()
  }, [liveChatId, liveBroadcastContent])

  // setInterval() を呼び出す副作用フック。レンダーの度にsetIntervalが何度も実行されて、オーバーフローやメモリリークが発生するので副作用フック内で行う
  useEffect( () => {
    //console.log( "call useEffect2 (setInterval)" )

    if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
      // 一定時間経過度に呼び出されるイベントハンドラ
      // setInterval(()=>{処理}, インターバル時間msec) : 一定時間度に {} で定義した処理を行う
      let timerChat = setInterval( ()=>{
        //console.log( "call timerChat" )
        //console.log( "[LiveChatList in useEffect2] liveChatId : ", liveChatId )
        //console.log( "[LiveChatList in useEffect2] liveBroadcastContent : ", liveBroadcastContent )
  
        // ライブチャット情報を取得
        if ( liveBroadcastContent === "live" || liveBroadcastContent === "upcoming" ) {
          getVideoChatInfos(getAPIKey(), liveChatId, VideoWatchPageConfig.maxResultsIntervalChat, 1, chatNextPageTokenRef.current )
            .then( ([videoChatInfos_, chatNumber_, nextPageToken_ ]) => {
              videoChatInfos_.forEach((videoChatInfo_: any)=> {
                videoChatInfosRef.current.push(videoChatInfo_)
              })
              chatNextPageTokenRef.current = nextPageToken_
              setVideoChatInfos([...videoChatInfos, ...videoChatInfosRef.current])
              //console.log( "[VideoWatchPage (timerChat)] videoChatInfosRef.current : ", videoChatInfosRef.current )
              //console.log( "[VideoWatchPage (timerChat)] videoChatInfos : ", videoChatInfos )
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
  // もっと見るボタンクリック時のイベントハンドラ
  const onClickShowMore = ((event: any) => {
    setShowMore(true)
  })

  // 一部を表示ボタンクリック時のイベントハンドラ
  const onClickShowLess = ((event: any) => {
    setShowMore(false)

    // scrollShowMoreRef.current は null である可能性があるので、optional chaining (.?) でアクセス
    //scrollShowMoreRef?.current?.scrollIntoView({behavior: "smooth", block: "start",});
    scrollShowMoreRef?.current?.scrollIntoView({block: "center",});
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  const channelURL = "https://www.youtube.com/channel/" + channelId
  const youtubeVideoURL = "https://www.youtube.com/watch?v=" + videoId
  //console.log( "[VideoWatchPage] liveChatId : ", liveChatId )
  //console.log( "[VideoWatchPage] liveBroadcastContent : ", liveBroadcastContent )
  //console.log( "[VideoWatchPage] videoChatInfosRef.current : ", videoChatInfosRef.current )  
  //console.log( "[VideoWatchPage] videoChatInfos : ", videoChatInfos )
  
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      { /* パスパラメーターの video_id が指定されてない場合は、動画検索ページにリダイレクト */ }
      { videoId == ":video_id" ? <Navigate to={AppConfig.videoSearchPage.path} /> : "" }
      {/* ヘッダー表示 */}      
      <Header title={AppConfig.title} selectedTabIdx={AppConfig.videoWatchPage.index} photoURL={authCurrentUser !== null ? authCurrentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* ボディ入力 */}
      <Box m={2}>
        <Typography variant="subtitle2">{messageVideo}</Typography>
        <Box style={{display: "flex"}}>
          { /* 動画表示 */ }
          <VideoPlayer videoId={videoId} autoPlay={true} videoWidth={VideoWatchPageConfig.videoWidth} videoHeight={VideoWatchPageConfig.videoHeight} liveChatId={liveChatId} liveBroadcastContent={liveBroadcastContent} videoChatInfos={videoChatInfos} showLiveChatCanvas={VideoWatchPageConfig.showLiveChatCanvas} chatCanvasMaxRow={VideoWatchPageConfig.chatCanvasMaxRow} darkMode={darkMode} />
          { /* チャット表示 */ }
          <LiveChatList liveChatId={liveChatId} liveBroadcastContent={liveBroadcastContent} videoChatInfos={videoChatInfos} darkMode={darkMode} />
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
            <div ref={scrollShowMoreRef} />   { /* useRef() で作成した scrollShowMoreRef を <div> の ref 属性に設定することで DOM 属性を取得できる */ }
            <Typography variant="body1">{showMore ? descriptionJsx : [...descriptionJsx.slice(0,10), "..."] }</Typography>
            { showMore ? "" : <Button variant="text" onClick={onClickShowMore}><Typography variant="subtitle2">もっと見る</Typography></Button> }
            { showMore ? <Button variant="text" onClick={onClickShowLess}><Typography variant="subtitle2">一部を表示</Typography></Button> : "" }
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
          <CommentList videoId={videoId} liveBroadcastContent={liveBroadcastContent} darkMode={darkMode} />
        </Box>          
      </Box>
    </ThemeProvider>
  );
}

export default VideoWatchPage;
