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
  // イベントハンドラ
  //------------------------
  // スクショボタンクリック時のイベントハンドラ 
  const onClickScreenShort = ((event: any) => {
    console.log( "call onClickScreenShort" )

    // DOM の id からスクリーンショットを取る対象の DOM 要素を取得
    //const targetDomElem: any = document.getElementById("screen-shot");
    const targetDomElem: any = document.querySelector("#screen-shot");
    console.log( "targetDomElem : ", targetDomElem )

    // html2canvas ライブラリのメソッドを呼び出し、スクショの画像データ canvas を取得
    html2canvas(targetDomElem, 
      {
        allowTaint: true, 
        useCORS: true,
        //width: window.screen.availWidth,      // キャプチャーするエリアのサイズ
        //height: window.screen.availHeight,
        x: targetDomElem.offsetLeft,
        y: targetDomElem.offsetTop,
        //scrollX: 0,
        //scrollY: -window.scrollY,
        //windowWidth: 2500,
        //width: 2500,
      }
    )
      .then( canvas => {
        console.log( "canvas : ", canvas )

        canvas.toBlob( (blob:any) => {
          const downloadLinkDomElem = document.createElement("a");

          if (typeof downloadLinkDomElem.download === "string") {
            // <a> タグの href 属性に 画像 URL を設定
            downloadLinkDomElem.href = window.URL.createObjectURL(blob);
        
            // ダウンロードファイル名
            downloadLinkDomElem.download = "player.png";
        
            // Firefox では body の中にダウンロードリンクがないといけないので一時的に追加
            document.body.appendChild(downloadLinkDomElem);
  
            // ダウンロードリンクが設定された a タグをクリック。これにより、自動ダウンロード出来る
            downloadLinkDomElem.click();
        
            // Firefox 対策で追加したリンクを削除しておく
            document.body.removeChild(downloadLinkDomElem);
          }
          else {
            window.open(window.URL.createObjectURL(blob));
          }
        })

        /*
        // スクショの画像データ canvas から 画像 URL を取得
        var screenImgURL = canvas.toDataURL('image/png');
        //console.log( "screenImgURL : ", screenImgURL )

        // ダウンロード URL を設定するための <a> タグを作成
        const downloadLinkDomElem = document.createElement("a");

        if (typeof downloadLinkDomElem.download === "string") {
          // <a> タグの href 属性に 画像 URL を設定
          downloadLinkDomElem.href = screenImgURL;
      
          // ダウンロードファイル名
          downloadLinkDomElem.download = "player.png";
      
          // Firefox では body の中にダウンロードリンクがないといけないので一時的に追加
          document.body.appendChild(downloadLinkDomElem);

          // ダウンロードリンクが設定された a タグをクリック。これにより、自動ダウンロード出来る
          downloadLinkDomElem.click();
      
          // Firefox 対策で追加したリンクを削除しておく
          document.body.removeChild(downloadLinkDomElem);
        }
        else {
          window.open(screenImgURL);
        }
        */
      });
  })

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
      <div id="screen-shot"><h1>スクショ画像</h1></div>
      <Button variant="text" onClick={onClickScreenShort}><Typography variant="subtitle2">スクショ</Typography></Button>
    </ThemeProvider>
  );
}

export default App;
