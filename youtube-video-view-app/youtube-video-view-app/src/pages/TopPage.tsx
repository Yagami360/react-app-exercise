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

import AppConfig, { TopPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// トップページを表示するコンポーネント
const TopPage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist(AppConfig.appName, "darkMode", false)
  
  //------------------------
  // イベントハンドラ
  //------------------------  

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title="YouTube Video View App" selectedTabIdx={AppConfig.topPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* ボディ入力 */}
      <Box m={2}>
        <Typography variant="subtitle1">TopPage</Typography>
      </Box>
    </ThemeProvider>
  );
}

export default TopPage;
