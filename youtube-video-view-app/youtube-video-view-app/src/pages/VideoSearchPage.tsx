/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'
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

import AppConfig, { VideoSearchPageConfig, YouTubeDataAPIConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import YouTubeVideoInfoCard from '../components/YouTubeVideoInfoCard'
import { LensTwoTone } from '@material-ui/icons';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// 動画検索を表示するコンポーネント
const VideoSearchPage: React.VFC = () => {  
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // 検索フォームの入力テキスト
  const [searchWord, setSearchWord] = useLocalPersist(AppConfig.appName, "searchWord", "")
  const [seachHistorys, setSeachHistorys] = useState([]);

  // 検索オプション
  const [seachOptionLive, setSeachOptionLive] = useState(false);

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const [seachResultsJsx, setSeachResultsJsx] = useState([]);
  const [seachResultsLiveJsx, setSeachResultsLiveJsx] = useState([]);
  const [seachResultsUpcomingJsx, setSeachResultsUpcomingJsx] = useState([]);

  // 副作用フック
  useEffect(() => {
    // 検索履歴
    if( auth.currentUser !== null && searchWord != "" ) {
      firestore.collection(VideoSearchPageConfig.collectionNameSearchWord).doc(auth.currentUser.email).collection(VideoSearchPageConfig.collectionNameSearchWord).get().then( (snapshot)=> {
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
    // submit イベント e の発生元であるフォームが持つデフォルトのイベント処理をキャンセル
    event.preventDefault(); 

    // 検索ワード入力に対しての処理
    if( searchWord != "" ) {
      // 検索履歴のデータベースに追加
      if( auth.currentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWord, 
          time: new Date(),   
        }
        firestore.collection(VideoSearchPageConfig.collectionNameSearchWord).doc(auth.currentUser.email).collection(VideoSearchPageConfig.collectionNameSearchWord).doc(searchWord).set(document).then((ref: any) => {
          console.log("added search word in ", VideoSearchPageConfig.collectionNameSearchWord)
        })
      }
     
      // YouTube Data APIを叩いて動画検索
      // エンドポイント : https://www.googleapis.com/youtube/v3/search
      // パスパラメーター : 
      //   type : 検索するリソースのタイプ。 channel, playlist, video を指定できます。動画を検索するので video を指定
      //   part : レスポンスに含めるリソースのプロパティを指定します。 id, snippet を指定できます。例えば snippet を指定するとレスポンスに動画の ID だけじゃなく、タイトルや説明が含まれるようになります。
      //   q : 検索クエリ
      let nextPageToken: string = ""
      //let nextPageToken = "CAUQAA"
      let seachResultsJsx_: any = []
      let seachResultsLiveJsx_: any = []
      let seachResultsUpcomingJsx_: any = []

      for (let i = 0; i < VideoSearchPageConfig.maxIterSearchVideo; i++) {
        console.log( "[before] nextPageToken : ", nextPageToken)
        console.log( "endpoint URL : ", YouTubeDataAPIConfig.url+"search" + '?key='+YouTubeDataAPIConfig.apiKey + '&type=video' + '&part=snippet' + '&q='+searchWord + '&maxResults='+VideoSearchPageConfig.maxResults + '&pageToken='+nextPageToken )
        fetch(YouTubeDataAPIConfig.url+"search" + '?key='+YouTubeDataAPIConfig.apiKey + '&type=video' + '&part=snippet' + '&q='+searchWord + '&maxResults='+VideoSearchPageConfig.maxResults + '&pageToken='+nextPageToken)
          .then( (response) => {            
            if ( !response.ok) {
              throw new Error();
            }
            return response.json()
          })
          .then((dataSearch) => {
            console.log("dataSearch : ", dataSearch)
            nextPageToken = dataSearch["nextPageToken"]
            const itemsSearch = dataSearch["items"]
            let totalResults = 0
            if( dataSearch["pageInfo"] !== undefined ) {
              totalResults = dataSearch["pageInfo"]["totalResults"]
            }
  
            itemsSearch.forEach((itemSearch: any)=> {
              //console.log("itemSearch : ", itemSearch)
              const channelId = itemSearch["snippet"]["channelId"]
              const channelTitle = itemSearch["snippet"]["channelTitle"]
              const videoId = itemSearch["id"]["videoId"]
              const title = itemSearch["snippet"]["title"]
              const publishTime = itemSearch["snippet"]["publishTime"]
              const thumbnailsHightUrl = itemSearch["snippet"]["thumbnails"]["high"]["url"]
              const description = itemSearch["snippet"]["description"]
              const liveBroadcastContent = itemSearch["snippet"]["liveBroadcastContent"]

              let profileImageUrl: any = undefined
              let subscriberCount: any = undefined
              let tags:any = []
              let viewCount:any = undefined
              let likeCount:any = undefined
              let dislikeCount:any = undefined
              let favoriteCount:any = undefined
              let categoryId:any = undefined
              let categoryTitle:any = undefined

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
                  const itemChannel = dataChannels["items"][0]
                  //console.log("itemChannel : ", itemChannel)
                  profileImageUrl = itemChannel["snippet"]["thumbnails"]["default"]["url"]
                  subscriberCount = itemChannel["statistics"]["subscriberCount"]

                  // YouTube Data API を使用して動画情報を取得
                  fetch(YouTubeDataAPIConfig.url+"videos" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet,statistics' + '&id='+videoId )
                    .then( (response) => {
                      if ( !response.ok) {
                        throw new Error();
                      }
                      return response.json()
                    })
                    .then((dataVideos) => {
                      const itemVideo = dataVideos["items"][0]
                      //console.log("itemVideo : ", itemVideo)
                      categoryId = itemVideo["snippet"]["categoryId"]
                      tags = itemVideo["snippet"]["tags"]
                      viewCount = itemVideo["statistics"]["viewCount"]
                      likeCount = itemVideo["statistics"]["likeCount"]
                      dislikeCount = itemVideo["statistics"]["dislikeCount"]
                      favoriteCount = itemVideo["statistics"]["favoriteCount"]

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
                          const itemVideoCategorie = dataVideoCategories["items"][0]
                          categoryTitle = itemVideoCategorie["snippet"]["title"]

                          // 検索結果を元に JSX 形式での Card 追加
                          /*
                          console.log( "kind : ", kind )
                          console.log( "videoId : ", videoId )
                          console.log( "channelId : ", channelId )            
                          console.log( "channelTitle : ", channelTitle )
                          console.log( "description : ", description )
                          console.log( "thumbnailsHightUrl : ", thumbnailsHightUrl )
                          console.log( "profileImageUrl : ", profileImageUrl )
                          console.log( "subscriberCount : ", subscriberCount )
                          console.log( "categoryId : ", categoryId )
                          console.log( "categoryTitle : ", categoryTitle )
                          console.log( "liveBroadcastContent : ", liveBroadcastContent )
                          */

                          if ( liveBroadcastContent == "live" ) {
                            seachResultsLiveJsx_.push(
                              <Grid item xs={3}>
                                <YouTubeVideoInfoCard 
                                  channelId={channelId} channelTitle={channelTitle} profileImageUrl={profileImageUrl} subscriberCount={subscriberCount}
                                  videoId={videoId} title={title} publishTime={publishTime} description={description} categoryTitle={categoryTitle}
                                  thumbnailsUrl={thumbnailsHightUrl} imageHeight={VideoSearchPageConfig.imageHeight} imageWidth={VideoSearchPageConfig.imageWidth}
                                  viewCount={viewCount} likeCount={likeCount} dislikeCount={dislikeCount} favoriteCount={favoriteCount}
                                  tags={tags}
                                />
                              </Grid>
                            )
                          }
                          else if ( liveBroadcastContent == "upcoming" ) {
                            seachResultsUpcomingJsx_.push(
                              <Grid item xs={3}>
                                <YouTubeVideoInfoCard 
                                  channelId={channelId} channelTitle={channelTitle} profileImageUrl={profileImageUrl} subscriberCount={subscriberCount}
                                  videoId={videoId} title={title} publishTime={publishTime} description={description} categoryTitle={categoryTitle}
                                  thumbnailsUrl={thumbnailsHightUrl} imageHeight={VideoSearchPageConfig.imageHeight} imageWidth={VideoSearchPageConfig.imageWidth}
                                  viewCount={viewCount} likeCount={likeCount} dislikeCount={dislikeCount} favoriteCount={favoriteCount}
                                  tags={tags}
                                />
                              </Grid>
                            )
                          }
                          else {
                            seachResultsJsx_.push(
                              <Grid item xs={3}>
                                <YouTubeVideoInfoCard 
                                  channelId={channelId} channelTitle={channelTitle} profileImageUrl={profileImageUrl} subscriberCount={subscriberCount}
                                  videoId={videoId} title={title} publishTime={publishTime} description={description} categoryTitle={categoryTitle}
                                  thumbnailsUrl={thumbnailsHightUrl} imageHeight={VideoSearchPageConfig.imageHeight} imageWidth={VideoSearchPageConfig.imageWidth}
                                  viewCount={viewCount} likeCount={likeCount} dislikeCount={dislikeCount} favoriteCount={favoriteCount}
                                  tags={tags}
                                />
                              </Grid>
                            )
                          }
                          //console.log( "seachResultsJsx_ : ", seachResultsJsx_ )                           
                        })
                        .catch(err => {
                          console.log(err);
                          setSearchMessage("動画カテゴリの取得に失敗しました" )
                        })                                                                            
                    })
                    .catch(err => {
                      console.log(err);
                      setSearchMessage("動画情報の取得に失敗しました" )
                    })                                                    
                })
                .catch(err => {
                  console.log(err);
                  setSearchMessage("チャンネル情報の取得に失敗しました" )
                })                
            })

            setSeachResultsJsx(seachResultsJsx_)
            setSeachResultsLiveJsx(seachResultsLiveJsx_)
            setSeachResultsUpcomingJsx(seachResultsUpcomingJsx_)
            setSearchMessage("件数 : " + totalResults)          

            console.log( "nextPageToken : ", nextPageToken)
            if ( nextPageToken == "" ) {
              return
            }
          })
          .catch(err => {
            console.log(err);
            setSearchMessage("動画の取得に失敗しました" )
          })
      }
    }
    else {
      setSearchMessage("検索ワードを入力してください" )   
    }
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "auth.currentUser : ", auth.currentUser )
  console.log( "seachResultsJsx : ", seachResultsJsx )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.videoSearchPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
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
                    label="動画検索"
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
      {/* 検索ヒットカード（ライブ配信） */}
      <Box m={1}>
        <Box m={1}>
          <Typography variant="subtitle2">配信中</Typography>
          <Box my={1}>
            <Divider/>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {seachResultsLiveJsx}
        </Grid>
      </Box>
      {/* 検索ヒットカード（配信予定） */}
      <Box m={1}>
        <Box m={1}>
          <Box mt={2}>
            <Typography variant="subtitle2">配信予定</Typography>
          </Box>
          <Box my={1}>
            <Divider/>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {seachResultsUpcomingJsx}
        </Grid>
      </Box>
      {/* 検索ヒットカード（アーカイブ） */}
      <Box m={1}>
        <Box m={1}>
          <Box mt={2}>
            <Typography variant="subtitle2">アーカイブ</Typography>
          </Box>
          <Box my={1}>
            <Divider/>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {seachResultsJsx}
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default VideoSearchPage;
