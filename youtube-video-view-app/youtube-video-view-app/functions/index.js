const functions = require("firebase-functions");
const fs = require('fs');
const ytdl = require('ytdl-core');

//==========================================================
// 動画 URL から動画データをダウンロード
// Cloud Funtion でリバースプロキシすることで CORS エラーを回避
//==========================================================
exports.downloadVideo = functions.https.onRequest((request, response) => {  
  console.log( "call downloadVideo" )

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
  const videoURL = request.body["videoURL"]
  console.log( `videoURL : ${videoURL}` )

  // 動画 URL から動画データをダウンロード
  fetch(
    videoURL, 
    {
      method: 'GET',
      mode: 'cors',  // CORS 対策
      //mode: 'no-cors',  // CORS 対策
    }
  )
    .then(response => {
      console.log("response : ", response)
      response.blob()
    })
    .then(data => {
      console.log("data : ", data)

      // レスポンス処理
      //response.send()
    })

  // ytdl-core ライブラリを使用して動画ダウンロード
  const stream = fs.createWriteStream(`${new Date().toISOString()}.mp4`)
  console.log("stream : ", stream )
  ytdl(videoURL).pipe(stream);

})
