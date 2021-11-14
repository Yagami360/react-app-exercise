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
import ImageCard from './components/ImageCard'
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
  const [images, setImages] = useState([]);

  // 画像検索 API を呼び出す際のクエリパラメータの一部となる（＝検索ワードとなる）文字列
  const [query, setQuery] = useState("cat");

  // 検索ヒット画像の表示を行う副作用フック
  useEffect(() => {
    // fetch メソッドで画像検索APIと非同期通信
    
  }, [images])

  //------------------------
  // イベントハンドラ
  //------------------------  
  // 入力フォーム更新時のイベントハンドラ
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value)
  }

  const onSubmitText = (event: React.FormEvent<HTMLFormElement>)=> {
    // submit イベント e の発生元であるフォームが持つデフォルトのイベント処理をキャンセル
    event.preventDefault();

    // Cloud Funtion 経由で Twitter API を呼び出す（Cloud Funtion をリバースプロキシとして利用）

    // 入力フォームのテキストをクリア
    setText("")
  }

  //------------------------
  // JSX での表示処理
  //------------------------
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
            <Grid item xs={10} sm={2}>   {/* xs : 画面の分割数, sm : 分割数に対しての使用する横幅数 */}
              <ImageCard title="title1" subheader="subheader2" imageFileName="./panda.jpg" imageHeight="300px" imageWidth="300px" contentsText="contents1" />
            </Grid>
            <Grid item xs={10} sm={2}>
              <ImageCard title="title2" subheader="subheader2" imageFileName="./panda.jpg" imageHeight="300px" imageWidth="300px" contentsText="contents2" />
            </Grid>            
            <Grid item xs={10} sm={2}>
              <ImageCard title="title3" subheader="subheader3" imageFileName="./panda.jpg" imageHeight="300px" imageWidth="300px" contentsText="contents3" />
            </Grid>            
          </Grid>
        </Grid>
      </BrowserRouter>
    </ThemeProvider>
    );
}

export default App;

//              margin="normal"