/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import './firebase/initFirebase'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";

import AppRoutes from './Config'
import AppTheme from './components/Theme';
import TopPage from './pages/TopPage'
import ImageSearchPage from './pages/ImageSearchPage'
import ProfileSearchPage from './pages/ProfileSearchPage'
import FavPage from './pages/FavPage'
import TimelinePage from './pages/TimelinePage'
import TestPage from './pages/TestPage'
import useLocalPersist from './components/LocalPersist';

const App: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist("twitter-image-search-app", "darkMode", false)

  // アプリのブラウザタイトルを変更
  useEffect(() => {
    document.title = "Twitter Image Search App"
  });

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "darkMode : ", darkMode )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>   {/* アプリ全体のテーマ色の設定 */}
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ルーティング設定 */}
      <BrowserRouter>
        <Routes>
          <Route path={AppRoutes.topPage.path} element={<TopPage />} />          
          <Route path={AppRoutes.imageSearchPage.path} element={<ImageSearchPage />} />
          <Route path={AppRoutes.profileSearchPage.path} element={<ProfileSearchPage />} />
          <Route path={AppRoutes.favPage.path} element={<FavPage />} />
          <Route path={AppRoutes.timeLinePage.path} element={<TimelinePage />} />
          <Route path={AppRoutes.testPage.path} element={<TestPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
