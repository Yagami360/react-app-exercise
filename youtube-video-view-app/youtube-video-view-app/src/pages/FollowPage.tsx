/* eslint-disable */
import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
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
import YouTubeVideoInfoCard from '../components/YouTubeVideoInfoCard'
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
    height: "250px", 
    objectFit: "cover",       // 画像をトリミング
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
  const searchVideoInfosAllRef = React.useRef<any>([] as any);                      // 全チャンネル
  const [searchVideoInfosAll, setSearchVideoInfosAll] = useState([] as any)         // ↑
  const [searchVideoInfosAllJsx, setSearchVideoInfosAllJsx] = useState([] as any)   // ↑
  const [channelInfo, setChannelInfo] = useState()                                  // 各チャンネル
  const [searchVideoInfos, setSearchVideoInfos] = useState([] as any)               // ↑
  const [searchVideoInfosJsx, setSearchVideoInfosJsx] = useState([] as any)         // ↑
  const channelDetailJsxRef = React.useRef<any>();
  const [channelDetailJsx, setChannelDetailJsx] = useState([] as any)
  const [showMore, setShowMore] = useState(false)
  const scrollShowMoreRef = useRef<HTMLDivElement>(null);  // useRef() : HTML の ref属性への参照

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

  // フォロー済みチャンネル一覧を取得する副作用フック
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
            //console.log( "index : ", index )

            channelInfosRef.current.push({
              "channelId" : field["channelId"],
              "title" : field["channelTitle"],
              "profileImageUrl" : field["profileImageUrl"],
              "subscriberCount" : undefined,            
            })

            channelListJsxRef.current.push(
              <ListItem onClick={onClickChannelList}>
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

  // 全チャンネルの動画一覧を設定する副作用フック  
  useEffect(() => {
    if( channelInfosRef.current !== undefined && searchVideoInfosAll.length > 0 ) {    
      // 各チャンネルに対してのループ
      for (let i = 0; i < channelInfosRef.current.length; i++) {   
        let searchVideoInfosAllJsx_: any[] = []
        // 各チャンネルの動画一覧に対してのループ
        searchVideoInfosAll[i].forEach((searchVideoInfo: any)=> {
          getVideoInfo(getAPIKey(), searchVideoInfo["videoId"])
            .then( (videoInfo_:any) => {
              const searchVideoInfoAllJsx_ = (
                <Grid item xs={3}>
                  <YouTubeVideoInfoCard 
                    channelId={channelInfosRef.current[i]["channelId"]} channelTitle={channelInfosRef.current[i]["title"]} profileImageUrl={channelInfosRef.current[i]["profileImageUrl"]} subscriberCount={channelInfosRef.current[i]["subscriberCount"]}
                    videoId={searchVideoInfo["videoId"]} title={searchVideoInfo["title"]} publishTime={searchVideoInfo["publishTime"]} description={searchVideoInfo["description"]} categoryTitle={""}
                    thumbnailsUrl={searchVideoInfo["thumbnailsHightUrl"]} imageHeight={FollowPageConfig.imageHeight} imageWidth={FollowPageConfig.imageWidth}
                    viewCount={videoInfo_["viewCount"]} likeCount={videoInfo_["likeCount"]} dislikeCount={videoInfo_["dislikeCount"]} favoriteCount={videoInfo_["favoriteCount"]}
                    tags={[]}
                  />
                </Grid>
              );
              setSearchVideoInfosAllJsx([...searchVideoInfosAllJsx_, searchVideoInfoAllJsx_])
              searchVideoInfosAllJsx_.push(searchVideoInfoAllJsx_)
            })
            .catch(err => {
              console.log(err);
              setMessage("チャンネル詳細情報の取得に失敗しました" )
            })        
        })

        // チャンネル詳細 body の JSX 設定
        channelDetailJsxRef.current = (<>
          { /* チャンネル動画一覧 */ }
          <Box m={2}>
            <Grid container spacing={2}>
              {searchVideoInfosAllJsx[i]}
            </Grid>
          </Box>
        </>);
        setChannelDetailJsx([...channelDetailJsx, channelDetailJsxRef.current])
      }
    }
  }, [searchVideoInfosAll])

  // 各チャンネルの動画一覧を設定する副作用フック
  useEffect(() => {
    if( channelInfo !== undefined ) {
      // 動画一覧設定
      let searchVideoInfosJsx_: any[] = []
      searchVideoInfos.forEach((searchVideoInfo: any)=> {
        getVideoInfo(getAPIKey(), searchVideoInfo["videoId"])
          .then( (videoInfo_:any) => {
            const searchVideoInfoJsx_ = (
              <Grid item xs={3}>
                <YouTubeVideoInfoCard 
                  channelId={channelInfo["channelId"]} channelTitle={channelInfo["title"]} profileImageUrl={channelInfo["profileImageUrl"]} subscriberCount={channelInfo["subscriberCount"]}
                  videoId={searchVideoInfo["videoId"]} title={searchVideoInfo["title"]} publishTime={searchVideoInfo["publishTime"]} description={searchVideoInfo["description"]} categoryTitle={""}
                  thumbnailsUrl={searchVideoInfo["thumbnailsHightUrl"]} imageHeight={FollowPageConfig.imageHeight} imageWidth={FollowPageConfig.imageWidth}
                  viewCount={videoInfo_["viewCount"]} likeCount={videoInfo_["likeCount"]} dislikeCount={videoInfo_["dislikeCount"]} favoriteCount={videoInfo_["favoriteCount"]}
                  tags={[]}
                />
              </Grid>
            );
            setSearchVideoInfosJsx([...searchVideoInfosJsx_, searchVideoInfoJsx_])
            searchVideoInfosJsx_.push(searchVideoInfoJsx_)
          })
          .catch(err => {
            console.log(err);
            setMessage("チャンネル詳細情報の取得に失敗しました" )
          })    
  
        //setSearchVideoInfosJsx(searchVideoInfosJsx_)
      })

      // チャンネル詳細 body の JSX 設定
      channelDetailJsxRef.current = (<>
        { /* バナー画像 */ }
        <Box>
          <img src={channelInfo["bannerExternalUrl"]} className={style.bannerImg} />
        </Box>
        { /* チャンネルアイコン */ }
        <ListItem >
          <Box style={{display:"flex"}}>
            <ListItemAvatar>
              <Avatar aria-label="avatar" src={channelInfo["profileImageUrl"]} style={{ width: 80, height: 80 }} />
            </ListItemAvatar>
            <ListItemText 
              primary={<>
                <Box mx={1} style={{display:"flex"}}>
                  <Typography component="span" variant="subtitle1" color="textPrimary" style={{display: "inline"}}>{channelInfo["title"]}</Typography>
                </Box>
              </>}
              secondary={<>
                <Box mx={1} style={{display:"flex"}}>
                  <Typography component="span" variant="subtitle2" color="textPrimary" style={{display: "inline"}}>{"チャンネル登録者数 : "+channelInfo["subscriberCount"]}</Typography>
                </Box>
              </>}
            />
          </Box>
        </ListItem>                  
        { /* チャンネル概要 */ }
        <Box m={1}>
          <div ref={scrollShowMoreRef} />   { /* useRef() で作成した scrollShowMoreRef を <div> の ref 属性に設定することで DOM 属性を取得できる */ }
          <Typography variant="body2">{showMore ? convertDescriptionToJsx(channelInfo["description"]) : [...convertDescriptionToJsx(channelInfo["description"]).slice(0,1), "..."] }</Typography>
          { showMore ? "" : <Button variant="text" onClick={onClickShowMore}><Typography variant="subtitle2">もっと見る</Typography></Button> }
          { showMore ? <Button variant="text" onClick={onClickShowLess}><Typography variant="subtitle2">一部を表示</Typography></Button> : "" }
        </Box>
        <Divider />
        { /* チャンネル動画一覧 */ }
        <Box m={2}>
          <Grid container spacing={2}>
            {searchVideoInfosJsx}
          </Grid>
        </Box>
      </>);
      setChannelDetailJsx(channelDetailJsxRef.current)
    }
  }, [searchVideoInfos])

  // 各チャンネルのチャンネル詳細 body の副作用フック
  useEffect(() => {
    if( channelInfo !== undefined ) {
      // チャンネル詳細 body の JSX 設定
      channelDetailJsxRef.current = (<>
        { /* バナー画像 */ }
        <Box>
          <img src={channelInfo["bannerExternalUrl"]} className={style.bannerImg} />
        </Box>
        { /* チャンネルアイコン */ }
        <ListItem >
          <Box style={{display:"flex"}}>
            <ListItemAvatar>
              <Avatar aria-label="avatar" src={channelInfo["profileImageUrl"]} style={{ width: 80, height: 80 }} />
            </ListItemAvatar>
            <ListItemText 
              primary={<>
                <Box mx={1} style={{display:"flex"}}>
                  <Typography component="span" variant="subtitle1" color="textPrimary" style={{display: "inline"}}>{channelInfo["title"]}</Typography>
                </Box>
              </>}
              secondary={<>
                <Box mx={1} style={{display:"flex"}}>
                  <Typography component="span" variant="subtitle2" color="textPrimary" style={{display: "inline"}}>{"チャンネル登録者数 : "+channelInfo["subscriberCount"]}</Typography>
                </Box>
              </>}
            />
          </Box>
        </ListItem>                  
        { /* チャンネル概要 */ }
        <Box m={1}>
          <div ref={scrollShowMoreRef} />   { /* useRef() で作成した scrollShowMoreRef を <div> の ref 属性に設定することで DOM 属性を取得できる */ }
          <Typography variant="body2">{showMore ? convertDescriptionToJsx(channelInfo["description"]) : [...convertDescriptionToJsx(channelInfo["description"]).slice(0,1), "..."] }</Typography>
          { showMore ? "" : <Button variant="text" onClick={onClickShowMore}><Typography variant="subtitle2">もっと見る</Typography></Button> }
          { showMore ? <Button variant="text" onClick={onClickShowLess}><Typography variant="subtitle2">一部を表示</Typography></Button> : "" }
        </Box>
        <Divider />
        { /* チャンネル動画一覧 */ }
        <Box m={2}>
          <Grid container spacing={2}>
            {searchVideoInfosJsx}
          </Grid>
        </Box>
      </>);
      setChannelDetailJsx(channelDetailJsxRef.current)
    }
  }, [channelInfo, showMore, searchVideoInfosJsx])

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
    let searchVideoInfosAll_: any[] = [];
    for (let i = 0; i < channelInfosRef.current.length; i++) {    
      // チャンネル ID を取得
      const channelId = channelInfosRef.current[i]["channelId"]

      // チャンネル ID からチャンネルの動画一覧取得
      searchVideos(getAPIKey(), "", FollowPageConfig.maxResultsAll, FollowPageConfig.iterSearchVideo, "", channelId, "date")
        .then( ([searchVideoInfos_, totalNumber_, searchNumber_, nextPageToken_]) => {
          //searchVideoInfosAll_.push(searchVideoInfos_)
          searchVideoInfosAll_[searchVideoInfosAll_.length] = searchVideoInfos_
          //searchVideoInfosAll_ = [...searchVideoInfosAll_]
          searchVideoInfosAllRef.current.push(searchVideoInfos_)
        })
        .catch(err => {
          console.log(err);
          setMessage("チャンネルの動画検索に失敗しました" )
        })    
    }

    console.log( "searchVideoInfosAll_ : ", searchVideoInfosAll_ )
    console.log( "searchVideoInfosAll_[0] : ", searchVideoInfosAll_[0] )
    console.log( "searchVideoInfosAll_.length : ", searchVideoInfosAll_.length )
    console.log( "searchVideoInfosAll_[0].length : ", searchVideoInfosAll_[0].length )
    //setSearchVideoInfosAll(searchVideoInfosAll_)
    setSearchVideoInfosAll(searchVideoInfosAllRef.current)
    //setSearchVideoInfosAll([...searchVideoInfosAll, searchVideoInfosAllRef.current][0])
  })

  const onClickChannelList = ((event: any) => {
    //console.log( "[onClickChannelList] event : ", event )
    //console.log( "[onClickChannelList] event.currentTarget : ", event.currentTarget )
    //console.log( "[onClickChannelList] event.currentTarget.innerText : ", event.currentTarget.innerText )

    // クリックされたリストのチャンネルタイトルからリスト番号を取得
    let index = 0
    const channelTitle = event.currentTarget.innerText
    for (let i = 0; i < channelInfosRef.current.length; i++) {
      if ( channelTitle === channelInfosRef.current[i]["title"]) {
        break
      }
      index += 1
    }
    setSelectedChannelIndex(index)

    // クリックされたリスト番号のチャンネル情報取得
    if( channelInfosRef.current.length > 0 ) {
      // チャンネル ID を取得
      const channelId = channelInfosRef.current[index]["channelId"]

      // チャンネル ID からチャンネル情報取得
      getChannelInfo(getAPIKey(), channelId)
        .then( (channelInfo_:any) => {
          //console.log( "[onClickChannelList] channelInfo_ : ", channelInfo_ )          
          setChannelInfo(channelInfo_)
        })
        .catch(err => {
          console.log(err);
          setMessage("チャンネル詳細情報の取得に失敗しました" )
        })    
        .finally( () => {
        })

      // チャンネル ID からチャンネルの動画一覧取得
      searchVideos(getAPIKey(), "", FollowPageConfig.maxResults, FollowPageConfig.iterSearchVideo, "", channelId, "date")
        .then( ([searchVideoInfos_, totalNumber_, searchNumber_, nextPageToken_]) => {
          //console.log( "[onClickChannelList] searchVideoInfos_ : ", searchVideoInfos_ )          
          setSearchVideoInfos(searchVideoInfos_)
        })
        .catch(err => {
          console.log(err);
          setMessage("チャンネルの動画検索に失敗しました" )
        })    
        .finally( () => {
        })      
    }
  })

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
  console.log("channelInfos : ", channelInfos )
  //console.log("channelListJsx : ", channelListJsx )
  //console.log("searchVideoInfosJsx : ", searchVideoInfosJsx )
  console.log("searchVideoInfosAll : ", searchVideoInfosAll )
  console.log("searchVideoInfosAllRef.current : ", searchVideoInfosAllRef.current )
  console.log("searchVideoInfosAllRef.current.length : ", searchVideoInfosAllRef.current.length )

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

