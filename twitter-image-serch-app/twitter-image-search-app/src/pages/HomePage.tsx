import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import '../firebase/initFirebase'

import { useTheme, ThemeProvider} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { TextField } from '@material-ui/core'
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";

import Header from '../components/Header'
import TwitterCard from '../components/TwitterCard'

const cloudFunctionUrl = "https://us-central1-twitter-image-search-app.cloudfunctions.net/callTwiterAPI"

// トップページを表示するコンポーネント
const HomePage: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
  // 検索フォームの入力テキスト
  const [searchWord, setSearchWord] = useState('')

  // 検索ヒット画像のリスト 
  const [seachResultsJsx, setSeachResultsJsx] = useState();

  //------------------------
  // イベントハンドラ
  //------------------------  
  // 入力フォーム更新時のイベントハンドラ
  const onChangeSearchWord = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchWord(event.currentTarget.value)
  }

  const onSubmitSearchWord = (event: React.FormEvent<HTMLFormElement>)=> {
    // submit イベント e の発生元であるフォームが持つデフォルトのイベント処理をキャンセル
    event.preventDefault();

    // Cloud Funtion 経由で Twitter API を呼び出す（Cloud Funtion をリバースプロキシとして利用）
    // Ajax 通信をするために、fetch API を使用（他にも axios を使用する方法もある）
    // fetch() は非同期処理でのリクエストメソッドで戻り値は Promise なので、then() メソッド内にリクエスト処理完了後の処理を定義する
    fetch(
      cloudFunctionUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "search_word" : searchWord + " filter:images" + " lang:ja",
          "count": 500,
        })
      }
    )
      .then( (response) => {
        //console.log("response : ", response)
        if ( !response.ok) {
          throw new Error();
        }
        return response.json()
      })
      .then((data) => {        
        //console.log("data : ", data)
        const tweets = data["tweets"]
        const statuses = tweets["statuses"]
        //console.log("tweets : ", tweets)
        //console.log("statuses : ", statuses)

        let seachResults_: any = []
        let seachResultsJsx_: any = []
        statuses.forEach((statuse: any)=> {
          //console.log("statuse : ", statuse)
          let imageUrl = "" 
          if (statuse["entities"]["media"] && statuse["entities"]["media"].indexOf(0)) {
            imageUrl = statuse["entities"]["media"][0]["media_url"]
          }
          else {
            return
          }
          //console.log("imageUrl : ", imageUrl)

          const userName = statuse["user"]["screen_name"]
          const profileImageUrl = statuse["user"]["profile_image_url"]
          const tweetTime = statuse["created_at"].replace("+0000","")
          const tweetText = statuse["text"]
          const tweetId = statuse["id_str"]
          //console.log("profileImageUrl : ", profileImageUrl)

          seachResultsJsx_.push(
            <Grid item xs={10} sm={2}>
              <TwitterCard userName={userName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="300px" contentsText={tweetText} />
            </Grid>
          )
        })
        setSeachResultsJsx(seachResultsJsx_)
      })
      .catch((reason) => {
        console.log("Tweet の取得に失敗しました", reason)
      });

    // 入力フォームのテキストをクリア
    //setSearchWord("")
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log("seachResultsJsx : ", seachResultsJsx)
  return (
    <ThemeProvider theme={theme}>
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" />
      {/* 検索ワード入力 */}
      <form onSubmit={onSubmitSearchWord}>
        <Box p={1} m={1} >
          {/* InputProps 属性の startAdornment キーで検索アイコン付きの入力フォームにする */}
          <TextField 
            onChange={onChangeSearchWord} 
            value={searchWord} 
            label="please type your search word"
            variant="outlined"
            InputProps={
              {startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)}
            }
          />
          <Button type="submit" variant="contained">🔍 検索</Button>
        </Box>
      </form>
      {/* 検索ヒット画像 */}
      <Grid container direction="column">
        <Grid item container spacing={2}>
            {seachResultsJsx}
        </Grid>
      </Grid>
    </ThemeProvider>
    );
}

export default HomePage;
