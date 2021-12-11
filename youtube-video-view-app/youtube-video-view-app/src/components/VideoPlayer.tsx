/* eslint-disable */
// React
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom';

// Material-UI
import { makeStyles } from '@material-ui/core/styles'
import { ThemeProvider} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

// スクリーンショット用
import html2canvas from "html2canvas";

// 自作モジュール
import AppTheme from './Theme';
import YouTubeIframeAPI from '../youtube_api/YouTubeIframeAPI'

//===========================================
// YouTube 動画プレイヤーを表示するコンポーネント
//===========================================
// グローバル変数
let player: any = undefined
const cloudFuntionDownloadVideoURL = "https://us-central1-video-view-app-684c0.cloudfunctions.net/downloadVideoFromYouTube"

// コンポーネントの引数
type Props = {
  videoId: any;
  autoPlay: boolean;
  videoWidth: string;
  videoHeight: string;  
  darkMode: boolean;
}

const VideoPlayer: React.FC<Props> = ({ 
  children,
  videoId,
  autoPlay,
  videoWidth, videoHeight,
  darkMode,
}) => {
  //------------------------
  // フック
  //------------------------
  const [message, setMessage] = useState("loading video")

  // ページ読み込み時の副作用フック
  useEffect( () => {
    if( videoId !== undefined && videoId !== "" ) {
      YouTubeIframeAPI.ready().then(() => {
        const autoPlayValue = (autoPlay === false ? 0 : 1);
        //console.log("autoPlayValue : ", autoPlayValue)

        // DOM の id 属性を iframe に置き換える
        player = new YT.Player(
          'player',     // この名前の HTML id 属性を iframe に置き換える
          {
            width: videoWidth,
            height: videoHeight,
            videoId: videoId,
            playerVars: {           // https://so-zou.jp/web-app/tech/web-api/google/youtube/player-api/#player-param
              autoplay: autoPlayValue,
              enablejsapi: 1,       // 1ならば、JavaScript APIが有効となる。
            },
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
            }
          }
        );

        setMessage("")
      });
    }
  }, [videoId, autoPlay])

  //------------------------
  // イベントハンドラ
  //------------------------
  // 動画読み込み時のイベントハンドラ
  const onPlayerReady = () => {
  };

  // Youtube Player のステート変更時のイベントハンドラ
  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    switch (event.data) {
      case -1:
        // 未開始
        break;
      case 0:
        // 終了
        break;
      case 1:
        // 再生中
        break;
      case 2:
        // 一時停止
        break;
      case 3:
        // バッファリング中
        break;
      case 5:
        // 頭出し済み
        break;
    }
  };

  // ダウンロードボタンクリック時のイベントハンドラ 
  const onClickDownload = ((event: any) => {
    console.log( "call onClickDownload" )

    // Cloud Funtion をリバースプロキシとして動画ダウンロード
    fetch(
      cloudFuntionDownloadVideoURL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "videoId" : videoId,
        })
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network error');
        }
        return response.blob();
      })
      .then((blob) => {
        // 動画データの URL 取得
        const videoDataURL = URL.createObjectURL(blob);

        // ダウンロード URL を設定するための <a> タグを作成
        const downloadLinkDomElem = document.createElement("a");
        if (typeof downloadLinkDomElem.download === "string") {
          // <a> タグの href 属性に 画像 URL を設定
          downloadLinkDomElem.href = videoDataURL;
      
          // ダウンロードファイル名
          downloadLinkDomElem.download = "${videoId}.png";
      
          // Firefox では body の中にダウンロードリンクがないといけないので一時的に追加
          document.body.appendChild(downloadLinkDomElem);
      
          // ダウンロードリンクが設定された a タグをクリック。これにより、自動ダウンロード出来る
          downloadLinkDomElem.click();
      
          // Firefox 対策で追加したリンクを削除しておく
          document.body.removeChild(downloadLinkDomElem);
        }
        else {
          window.open(videoDataURL);
        }        
      })
  })

  // スクショボタンクリック時のイベントハンドラ 
  const onClickScreenShort = ((event: any) => {
    console.log( "call onClickScreenShort" )

    // DOM の id からスクリーンショットを取る対象の DOM 要素を取得
    const targetDomElem: any = document.getElementById("player");
    console.log( "targetDomElem : ", targetDomElem )

    // html2canvas ライブラリのメソッドを呼び出し、スクショの画像データ canvas を取得
    html2canvas(
      targetDomElem, 
      {
        allowTaint: true, 
        useCORS: true,
      }
    )
      .then( canvas => {
        // [ToDo] canvas 内の画像データがブランク画像になるバグの修正

        // スクショの画像データ canvas から 画像 URL を取得
        var screenImgURL = canvas.toDataURL('image/png');

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
      });

      /*
      if (player) {
        // 動画 URL を取得
        const videoURL = player.getVideoUrl();

        // スクショ画像をとる DOM 要素取得
        const targetDomElem: any = document.getElementById('screen-shot'); 
        console.log( "[before] targetDomElem : ", targetDomElem )
  
        if (targetDomElem) { 
          // video 要素を作成
          var videoDomElem = document.createElement('video');
          videoDomElem.src = videoURL + "?sanitize=true"; // sanitize=true を追加して CORB 対策
          console.log("videoDomElem : ", videoDomElem)
  
          // canvas 要素を作成
          const canvas = document.createElement('canvas'); 
          canvas.width = targetDomElem.clientWidth; 
          canvas.height = targetDomElem.clientHeight; 
          const context: any = canvas.getContext('2d'); 
          context.drawImage(videoDomElem, 0, 0, canvas.width, canvas.height); 
          console.log("canvas : ", canvas)
  
          // スクショの画像データ canvas から 画像 URL を取得
          const screenImgURL = canvas.toDataURL('image/png'); 

          // ダウンロード URL を設定するための <a> タグを作成
          const downloadLinkDomElem = document.createElement('a'); 
          downloadLinkDomElem.download = `screen-shot-${new Date().toISOString()}.png`; 
          downloadLinkDomElem.target = '_blank'; 
          downloadLinkDomElem.href = screenImgURL; 
          console.log( "[after] targetDomElem : ", targetDomElem )
          downloadLinkDomElem.click(); 
      }
      else {
          alert('There is no video tag.'); 
      }
      */
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  //console.log( "[VideoPlayer] videoURL : ", videoURL )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      <Typography>{message}</Typography> 
      <Box style={{display: "block"}}>
        { /* 動画表示。id="player" の部分が iframe に置き換わる */ }
        <div id="player"></div>
        { /* コントロールパネル */ }
        <Box mx={1} style={{textAlign: "right"}}>
          <Button variant="text" onClick={onClickDownload}><Typography variant="subtitle2">ダウンロード</Typography></Button>
          <Button variant="text" onClick={onClickScreenShort}><Typography variant="subtitle2">スクショ</Typography></Button>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default VideoPlayer;
