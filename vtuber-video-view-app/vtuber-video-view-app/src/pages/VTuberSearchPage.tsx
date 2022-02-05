/* eslint-disable */
import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

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
import { LensTwoTone } from '@material-ui/icons';

import InfiniteScroll from "react-infinite-scroller"

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
        // document.data() : ドキュメント内のフィールド
        const field = document.data()
        console.log( "field : ", field )

        vtuberListJsxRef.current.push(field)
      })         
      setVtuberListJsx(vtuberListJsxRef.current)
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

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "auth.currentUser : ", auth.currentUser )
  //console.log( "authCurrentUser : ", authCurrentUser )
  //console.log( "seachResultsJsx : ", seachResultsJsx )
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
    </ThemeProvider>
  );
}

export default VTuberSearchPage;
