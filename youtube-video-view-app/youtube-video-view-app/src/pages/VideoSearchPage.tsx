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
import { LensTwoTone } from '@material-ui/icons';

import AppConfig, { VideoSearchPageConfig, YouTubeDataAPIConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import YouTubeVideoInfoCard from '../components/YouTubeVideoInfoCard'
import { getChannelIdFromVideoId, getChannelInfo, getVideoInfo, getVideoCategoryInfo, getVideoCommentInfos, getVideoChatInfos, searchVideos } from '../youtube_api/YouTubeDataAPI';

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
     
      let searchVideoInfos: any = []
      let seachResultsJsx_: any = []
      let seachResultsLiveJsx_: any = []
      let seachResultsUpcomingJsx_: any = []

      // 検索ワードから動画を検索
      searchVideos(YouTubeDataAPIConfig.apiKey, searchWord, VideoSearchPageConfig.maxResults, VideoSearchPageConfig.iterSearchVideo)
        .then( ([searchVideoInfos_, totalNumber_, searchNumber_]) => {
          setSearchMessage("件数 : " + totalNumber_)
          searchVideoInfos = searchVideoInfos_
          //console.log( "searchVideoInfos_ : ", searchVideoInfos_ )

          // 各動画に対しての処理
          searchVideoInfos_.forEach((searchVideoInfo_: any)=> {
            let channelInfo: any = undefined
            let videoInfo: any = undefined
            let videoCategoryInfo: any = undefined

            // チャンネル情報を取得
            getChannelInfo(YouTubeDataAPIConfig.apiKey, searchVideoInfo_["channelId"])
              .then( (channelInfo_) => {
                channelInfo = channelInfo_
                console.log( "channelInfo_ : ", channelInfo_ )

                // 動画情報を取得
                getVideoInfo(YouTubeDataAPIConfig.apiKey, searchVideoInfo_["videoId"])
                  .then( (videoInfo_) => {
                    videoInfo = videoInfo_
                    console.log( "videoInfo_ : ", videoInfo_ )

                    // 動画カテゴリ情報の取得
                    getVideoCategoryInfo(YouTubeDataAPIConfig.apiKey, videoInfo_["categoryId"])
                      .then( (videoCategoryInfo_) => {
                        videoCategoryInfo = videoCategoryInfo_
                        console.log( "videoCategoryInfo_ : ", videoCategoryInfo_ )   

                        // Youtube Card コンポーネントを追加
                        if ( searchVideoInfo_["liveBroadcastContent"] == "live" ) {
                          seachResultsLiveJsx_.push(
                            <Grid item xs={3}>
                              <YouTubeVideoInfoCard 
                                channelId={channelInfo["channelId"]} channelTitle={channelInfo["title"]} profileImageUrl={channelInfo["profileImageUrl"]} subscriberCount={channelInfo["subscriberCount"]}
                                videoId={videoInfo["videoId"]} title={videoInfo["title"]} publishTime={videoInfo["publishedAt"]} description={videoInfo["description"]} categoryTitle={videoCategoryInfo["title"]}
                                thumbnailsUrl={searchVideoInfo_["thumbnailsHightUrl"]} imageHeight={VideoSearchPageConfig.imageHeight} imageWidth={VideoSearchPageConfig.imageWidth}
                                viewCount={videoInfo["viewCount"]} likeCount={videoInfo["likeCount"]} dislikeCount={videoInfo["dislikeCount"]} favoriteCount={videoInfo["favoriteCount"]}
                                tags={videoInfo["tags"]}
                              />
                            </Grid>
                          )
                        }
                        else if ( searchVideoInfo_["liveBroadcastContent"] == "upcoming" ) {
                          seachResultsUpcomingJsx_.push(
                            <Grid item xs={3}>
                              <YouTubeVideoInfoCard 
                                channelId={channelInfo["channelId"]} channelTitle={channelInfo["title"]} profileImageUrl={channelInfo["profileImageUrl"]} subscriberCount={channelInfo["subscriberCount"]}
                                videoId={videoInfo["videoId"]} title={videoInfo["title"]} publishTime={videoInfo["publishedAt"]} description={videoInfo["description"]} categoryTitle={videoCategoryInfo["title"]}
                                thumbnailsUrl={searchVideoInfo_["thumbnailsHightUrl"]} imageHeight={VideoSearchPageConfig.imageHeight} imageWidth={VideoSearchPageConfig.imageWidth}
                                viewCount={videoInfo["viewCount"]} likeCount={videoInfo["likeCount"]} dislikeCount={videoInfo["dislikeCount"]} favoriteCount={videoInfo["favoriteCount"]}
                                tags={videoInfo["tags"]}
                              />
                            </Grid>
                          )
                        }
                        else {
                          seachResultsJsx_.push(
                            <Grid item xs={3}>
                              <YouTubeVideoInfoCard 
                                channelId={channelInfo["channelId"]} channelTitle={channelInfo["title"]} profileImageUrl={channelInfo["profileImageUrl"]} subscriberCount={channelInfo["subscriberCount"]}
                                videoId={videoInfo["videoId"]} title={videoInfo["title"]} publishTime={videoInfo["publishedAt"]} description={videoInfo["description"]} categoryTitle={videoCategoryInfo["title"]}
                                thumbnailsUrl={searchVideoInfo_["thumbnailsHightUrl"]} imageHeight={VideoSearchPageConfig.imageHeight} imageWidth={VideoSearchPageConfig.imageWidth}
                                viewCount={videoInfo["viewCount"]} likeCount={videoInfo["likeCount"]} dislikeCount={videoInfo["dislikeCount"]} favoriteCount={videoInfo["favoriteCount"]}
                                tags={videoInfo["tags"]}
                              />
                            </Grid>
                          )
                        }
                      })
                      .catch(err => {
                        console.log(err);
                        setSearchMessage("動画カテゴリ情報の取得に失敗しました" )
                      })    
                      .finally( () => {
                      })
                  })
                  .catch(err => {
                    console.log(err);
                    setSearchMessage("動画情報の取得に失敗しました" )
                  })
                  .finally( () => {
                  })
              })
              .catch(err => {
                console.log(err);
                setSearchMessage("チャンネルの取得に失敗しました" )
              })    
              .finally( () => {
              })
          })

          setSeachResultsJsx(seachResultsJsx_)
          setSeachResultsLiveJsx(seachResultsLiveJsx_)
          setSeachResultsUpcomingJsx(seachResultsUpcomingJsx_)
        })
        .catch(err => {
          console.log(err);
          setSearchMessage("動画検索に失敗しました" )
        })    
        .finally( () => {
        })
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
