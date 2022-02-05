/* eslint-disable */
// React
import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

// Material UI
import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

// firebase
import firebase from "firebase";
import './firebase/initFirebase'

// スクリーンショット用
import html2canvas from "html2canvas";

// 自作モジュール
import AppConfig from './Config'
import AppTheme from './components/Theme';
import useLocalPersist from './components/LocalPersist';

import TopPage from './pages/TopPage'
import VTuberSearchPage from './pages/VTuberSearchPage'
import VideoSearchPage from './pages/VideoSearchPage'
import VideoWatchPage from './pages/VideoWatchPage'
import FavVideoPage from './pages/FavVideoPage'
import FavVTuberPage from './pages/FavVTuberPage'

const App: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)

  // アプリのブラウザタイトルを変更
  useEffect(() => {
    document.title = AppConfig.appName
  });

  //------------------------
  // イベントハンドラ
  //------------------------

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "process.env : ", process.env )
  console.log( "darkMode : ", darkMode )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>   {/* アプリ全体のテーマ色の設定 */}
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ルーティング設定 */}
      <BrowserRouter>
        <Routes>
          <Route path={AppConfig.topPage.path} element={<TopPage />} />
          <Route path={AppConfig.vtuberSearchPage.path} element={<VTuberSearchPage />} />
          <Route path={AppConfig.videoSearchPage.path} element={<VideoSearchPage />} />
          <Route path={AppConfig.videoWatchPage.path} element={<VideoWatchPage />} />
          <Route path={AppConfig.favVideoPage.path} element={<FavVideoPage />} />
          <Route path={AppConfig.favVTuberPage.path} element={<FavVTuberPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
