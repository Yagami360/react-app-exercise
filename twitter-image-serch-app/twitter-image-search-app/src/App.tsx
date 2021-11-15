import React from 'react';
import { useState, useEffect } from 'react'
import Box from '@material-ui/core/Box';
import { TextField } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles';
import { ThemeProvider　} from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";
import Header from './components/Header'
import TwitterCard from './components/TwitterCard'
import ImagePage from './pages/ImagePage'

const cloudFunctionUrl = "https://us-central1-twitter-image-search-app.cloudfunctions.net/callTwiterAPI"

const App: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
  // 検索フォームの入力テキスト
  const [text, setText] = useState('')

  // 検索ヒット画像のリスト 
  const [seachResults, setSeachResults] = useState();
  const [seachResultsJsx, setSeachResultsJsx] = useState();

  //------------------------
  // イベントハンドラ
  //------------------------  
  // 入力フォーム更新時のイベントハンドラ
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value)
  }

  const onSubmitText = (event: React.FormEvent<HTMLFormElement>)=> {
    console.log("call onSubmitText")

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
          "search_word" : text + " " + "filter:images" + " " + "lang:ja",
          "count": 100,
        })
      }
    )
      .then( (response) => {
        console.log("response : ", response)
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
          console.log("statuse : ", statuse)

          const userName = statuse["user"]["screen_name"]
          console.log("userName : ", userName)
          const tweetTime = statuse["created_at"]
          console.log("tweetTime : ", tweetTime)
          const tweetText = statuse["text"]
          console.log("tweetText : ", tweetText)
          let imageUrl = "" 
          if (statuse["entities"]["media"] && statuse["entities"]["media"].indexOf(0)) {
            imageUrl = statuse["entities"]["media"][0]["media_url"]
          }
          console.log("imageUrl : ", imageUrl)

          seachResults_.push({
            "userName" : userName,
            "tweetTime" : tweetTime,
            "tweetText" : tweetText,
            "imageUrl" : imageUrl,          
          })
          seachResultsJsx_.push(
            <Grid item xs={10} sm={2}>
              <TwitterCard title={"@"+userName} subheader={tweetTime} imageFileName={imageUrl} imageHeight="300px" imageWidth="300px" contentsText={tweetText} />
            </Grid>
          )

          console.log("seachResults_ : ", seachResults_)
          console.log("seachResultsJsx_ : ", seachResultsJsx_)
        })
        setSeachResults(seachResults_)
        setSeachResultsJsx(seachResultsJsx_)
      })
      .catch((reason) => {
        console.log("Tweet の取得に失敗しました", reason)
      });

    // 入力フォームのテキストをクリア
    setText("")
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log("seachResults : ", seachResults)
  console.log("seachResultsJsx : ", seachResultsJsx)

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {/* ルーティング設定 */}
        <Routes>
          <Route path="/image" element={<ImagePage />} />
        </Routes>
        {/* ヘッダー表示 */}      
        <Header text="Twitter Image Search App" />
        {/* 検索ワード入力 */}
        <form onSubmit={onSubmitText}>
          <Box p={1} m={1} >
            {/* InputProps 属性の startAdornment キーで検索アイコン付きの入力フォームにする */}
            <TextField 
              onChange={onChangeText} 
              value={text} 
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
      </BrowserRouter>
    </ThemeProvider>
    );
}

export default App;

//              margin="normal"
