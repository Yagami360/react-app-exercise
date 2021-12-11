const functions = require("firebase-functions");
const fs = require('fs');
const ytdl = require('ytdl-core');

//==========================================================
// 動画 URL から動画データをダウンロード
// Cloud Funtion でリバースプロキシすることで CORS エラーを回避
//==========================================================
exports.downloadVideoFromYouTube = functions.https.onRequest((request, response) => {  
  console.log( "call downloadVideoFromYouTube" )

  // CORS 設定（この処理を入れないと Cloud Funtion 呼び出し元で No 'Access-Control-Allow-Origin' のエラーが出る）
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      response.set('Access-Control-Allow-Methods', 'GET');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
      response.set('Access-Control-Max-Age', '3600');
      response.status(204).send('');
  }

  //
  //const videoId = request.body["videoId"]
  //const { videoId } = request.params;
  const videoId = "tqfNjYE2UQk"

  const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
  console.log( `videoId : ${videoId}` )
  console.log( `videoURL : ${videoURL}` )

  // ytdl オブジェクト作成
  const stream = ytdl(videoURL, { quality: 'highest' });
  console.log( `stream : ${stream}` )

  // ダウンロード処理実行開始
  stream.pipe(fs.createWriteStream(`${videoId}.mp4`));  

  // ダウンロードエラー時のイベントハンドラ
  stream.on('error', (err) => {
    console.log( "stream.on('error') : ", err )
    response.status(400).send('download error!');
  });

  // ダウンロード終了時のイベントハンドラ
  stream.on('end', () => {
    console.log( "stream.on('end')" )
    response.download(`tmp/${videoId}.mp4`);
    response.status(200).send('download successed!');
  });
})
