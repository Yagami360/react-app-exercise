import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import './firebase/initFirebase'

import { createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";

import AppRoutes from './Config'
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

  // テーマ（画面全体のスタイル）の設定
  const theme = createMuiTheme({
    palette: {
      type: darkMode ? "dark" : "light",
    },
  });

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "darkMode : ", darkMode )

  return (
    <ThemeProvider theme={theme}>   {/* アプリ全体のテーマ色の設定 */}
      {/* 各ブラウザーの差異を平均化させる  */}
      <CssBaseline />
      {/* ルーティング設定 */}
      <BrowserRouter>
        <Routes>
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
