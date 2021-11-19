import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import './firebase/initFirebase'

import { useTheme, ThemeProvider} from '@material-ui/core/styles';

import HomePage from './pages/HomePage'
import FavPage from './pages/FavPage'
import FollowPage from './pages/FollowPage'

const App: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <ThemeProvider theme={theme}>
      {/* ルーティング設定 */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fav" element={<FavPage />} />
          <Route path="/follow" element={<FollowPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
    );
}

export default App;
