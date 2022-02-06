/* eslint-disable */
import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import firebase from "firebase";
import '../firebase/initFirebase'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton';
import YouTubeIcon from '@material-ui/icons/YouTube';
import TwitterIcon from '@material-ui/icons/Twitter';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';
import StarIcon from '@material-ui/icons/Star';

import AppConfig, { VTuberSearchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import YouTubeVideoInfoCard from '../components/YouTubeVideoInfoCard'
import { getAPIKey, getChannelIdFromVideoId, getChannelInfo, getVideoInfo, getVideoCategoryInfo, getVideoCommentInfos, getVideoChatInfos, searchVideos } from '../youtube_api/YouTubeDataAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//=======================================
// VTuber検索ページを表示するコンポーネント
//=======================================
const VTuberSearchPage: React.VFC = () => {  
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", true)

  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

  // お気に入り追加状態
  //const collectionNameFavVTuber = 'fav-vtuber-database'
  //const [savedFavVTuber, setSavedFavVTuber] = useLocalPersist( AppConfig.appName + ":fav_vtuber", channelId, false)  
  const savedFavVTuber = false

  // 検索フォームの入力テキスト
  const [searchWord, setSearchWord] = useLocalPersist(AppConfig.appName, "searchWord", "")
  const [seachHistorys, setSeachHistorys] = useState([]);

  // VTuber リスト
  const vtuberListJsxRef = React.useRef<any>([]);
  const [vtuberListJsx, setVtuberListJsx] = useState([] as any);

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット動画情報のリスト 
  const nextPageTokenRef = React.useRef<string>("");  
  const [seachResultsJsx, setSeachResultsJsx] = useState([] as any);

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

  // VTuberデータベース取得の副作用フック
  useEffect(() => {
    firestore.collection(VTuberSearchPageConfig.collectionNameVTuber).get().then( (snapshot)=> {
      snapshot.forEach((document)=> {
        const field = document.data()
        const youtubeURL = "https://www.youtube.com/channel/" + field.youtube_channel_id
        const twitterURL = "https://twitter.com/" + field.twitter_user_id
        //console.log( "field : ", field )

        // YouTube Data API を使用してチャンネル情報を取得        
        getChannelInfo(getAPIKey(), field.youtube_channel_id)
          .then( (channelInfo) => {
            //console.log( "channelInfo : ", channelInfo )

            // JSX 形式に変換
            const vtuberListJsx_ = (<>
              <ListItem button component="a" href={youtubeURL}>
                { /* アイコン画像 */ }
                <ListItemAvatar>
                  <Avatar aria-label="avatar" src={channelInfo["profileImageUrl"]} style={{ width: 80, height: 80 }} />
                </ListItemAvatar>
                <ListItemText 
                  primary={<>
                    <Box mx={1} style={{display:"flex"}}>
                      { /* YouTuber 名 */ }
                      <Typography variant="h5">{field.name}</Typography>
                    </Box>
                  </>}
                  secondary={<>
                    <Box mx={1}>
                      { /* 所属 */ }
                      <Typography variant="subtitle1">{field.organization}</Typography>
                      { /* チャンネル登録者数 */ }
                      <Typography variant="subtitle2">{"登録者数 : "+channelInfo["subscriberCount"]+" 人"}</Typography>
                    </Box>
                  </>}
                />
                { /* YouTube */ }                
                <Link href={youtubeURL}><YouTubeIcon style={{ width: 50, height: 50 }} fontSize="large" /></Link>
                { /* Twitter */ }                
                <Link href={twitterURL}><TwitterIcon style={{ width: 50, height: 50 }} fontSize="large" /></Link>
                { /* お気に入り */ }
                <IconButton aria-label="settings" onClick={onClickFavVTuber} >
                  { (savedFavVTuber ===  false) ? <StarBorderOutlinedIcon style={{ width: 40, height: 40 }} fontSize="large" /> : <StarIcon style={{ width: 50, height: 50 }} fontSize="large" /> }
                </IconButton>
              </ListItem>
              <Divider variant="inset" component="li" />            
            </>)

            setVtuberListJsx([...vtuberListJsxRef.current, vtuberListJsx_])            
            vtuberListJsxRef.current.push(vtuberListJsx_)
          })
          .catch(err => {
            console.log(err);
          })
      })         
    })
  }, [])

  // 検索履歴表示の副作用フック
  useEffect(() => {
    // 検索履歴
    if( authCurrentUser !== null && searchWord != "" ) {
      firestore.collection(VTuberSearchPageConfig.collectionNameSearchWord).doc(authCurrentUser?.email).collection(VTuberSearchPageConfig.collectionNameSearchWord).get().then( (snapshot)=> {
        let id = 1
        let seachHistorys_: any = []
        snapshot.forEach((document)=> {
          // document.data() : ドキュメント内のフィールド
          const field = document.data()
          seachHistorys_.push({ id: id, name: field.searchWord })
          id += 1
        })         
        setSeachHistorys(seachHistorys_)
      })
    }
  }, [searchWord])

  //------------------------
  // イベントハンドラ
  //------------------------  
  // 入力フォーム更新時のイベントハンドラ
  const onChangeSearchWordTextField = (event: any) => {
    setSearchWord(event.currentTarget.value)
  }

  const onChangeSearchWordAutocomplete = (event: any, values: any) => {
    setSearchWord(values)
  }

  const onSubmitSearchWord = (event: React.FormEvent<HTMLFormElement>)=> {
    console.log( "call onSubmitSearchWord")
    // submit イベント e の発生元であるフォームが持つデフォルトのイベント処理をキャンセル
    event.preventDefault(); 

    // 検索ワード入力に対しての処理
    if( searchWord != "" ) {
      // 検索履歴のデータベースに追加
      if( authCurrentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWord, 
          time: new Date(),   
        }
        firestore.collection(VTuberSearchPageConfig.collectionNameSearchWord).doc(authCurrentUser?.email).collection(VTuberSearchPageConfig.collectionNameSearchWord).doc(searchWord).set(document).then((ref: any) => {
          console.log("added search word in ", VTuberSearchPageConfig.collectionNameSearchWord)
        })
      }
     
      // 検索ワードからVTuber を検索

     }
    else {
      setSearchMessage("検索ワードを入力してください" )   
    }
  }

  // お気に入り追加ボタンクリック時のイベントハンドラ
  const onClickFavVTuber = ((event: any)=> {
    console.log("savedFavVTuber : ", savedFavVTuber )

    if( auth.currentUser === null ) {
      return
    }

    // 未フォローの場合
    /*
    if( savedFavVTuber === false ) {
      //setSavedFavVTuber(true)

      // 新規に追加するドキュメントデータ
      const document = {
        channelId: channelId,
        channelTitle: channelTitle,     
        profileImageUrl: profileImageUrl,
      }

      // firestore.collection(コレクション名).doc(ドキュメントID).set(ドキュメントデータ) で、コレクションに新たなドキュメントを追加する
      firestore.collection(VTuberSearchPageConfig.collectionNameFavVTuber).doc(auth.currentUser.email).collection(VTuberSearchPageConfig.collectionNameFavVTuber).doc(AppConfig.appName+":follow:"+channelId).set(document).then((ref: any) => {
        console.log("added tweet in ", VTuberSearchPageConfig.collectionNameFavVTuber)
      })
    }
    // 既にお気に入りに追加している場合
    else {
      //setSavedFavVTuber(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(VTuberSearchPageConfig.collectionNameFavVTuber).doc(auth.currentUser.email).collection(VTuberSearchPageConfig.collectionNameFavVTuber).doc(AppConfig.appName+":follow:"+channelId).delete().then((ref: any)=> {
        console.log("deleted tweet in ", VTuberSearchPageConfig.collectionNameFavVTuber)
      })
    }
    */
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "auth.currentUser : ", auth.currentUser )
  //console.log( "authCurrentUser : ", authCurrentUser )
  //console.log( "seachResultsJsx : ", seachResultsJsx )
  console.log( "vtuberListJsxRef.current : ", vtuberListJsxRef.current )
  console.log( "vtuberListJsx : ", vtuberListJsx )

  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title={AppConfig.title} selectedTabIdx={AppConfig.videoSearchPage.index} photoURL={authCurrentUser !== null ? authCurrentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* 検索ワード入力 */}
      <Box m={2}>
        <form onSubmit={onSubmitSearchWord}>
          <Grid container spacing={1}>
            {/* 動画検索ワード入力 */}
            <Grid item xs={2}>
              <Autocomplete 
                freeSolo
                disableClearable
                onChange={onChangeSearchWordAutocomplete}
                id="動画検索"
                options={seachHistorys.map((option: any) => option.name)}
                renderInput={ (params: any) => (
                  <TextField 
                    {...params}
                    onChange={onChangeSearchWordTextField} 
                    value={searchWord} 
                    label="VTuber検索"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                      startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                    }}
                  />            
                )}
              />
            </Grid>          
            { /* 検索ボタン　*/ }
            <Grid item xs={1}>
              <Button type="submit" variant="contained" style={{ borderRadius: 25 }}>
                <Typography variant="subtitle1">🔍 検索</Typography>
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      <Typography variant="subtitle2">{searchMessage}</Typography>
      {/* VTuberリスト表示 */}
      <List component="div">
        {vtuberListJsx}
      </List>      
    </ThemeProvider>
  );
}

export default VTuberSearchPage;
