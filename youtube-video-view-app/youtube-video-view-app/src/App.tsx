/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import './firebase/initFirebase'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";

import AppConfig from './Config'
import AppTheme from './components/Theme';
import useLocalPersist from './components/LocalPersist';

import TopPage from './pages/TopPage'
import VideoSearchPage from './pages/VideoSearchPage'
import VideoWatchPage from './pages/VideoWatchPage'
import FavPage from './pages/FavPage'
import FollowPage from './pages/FollowPage'
import TestPage from './pages/TestPage'

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
          <Route path={AppConfig.videoSearchPage.path} element={<VideoSearchPage />} />
          <Route path={AppConfig.videoWatchPage.path} element={<VideoWatchPage />} />
          <Route path={AppConfig.favPage.path} element={<FavPage />} />
          <Route path={AppConfig.followPage.path} element={<FollowPage />} />
          <Route path={AppConfig.testPage.path} element={<TestPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
