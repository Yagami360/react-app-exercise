const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Twitter = require('twitter');

admin.initializeApp();
const config = functions.config()
console.log("config : ", config )

const client = new Twitter({
  consumer_key: config["twitter_consumer_key"] || "",           // 型が 'string | undefined' なので、"xxx" || "" で初期化
  consumer_secret: config["twitter_consumer_secret"] || "",
  access_token_key: config["twitter_access_token_key"] || "",
  access_token_secret: config["twitter_access_secret"] || "",
})

// 通信テスト
/*
var params = {screen_name: 'yagami_360',count:20};
client.get('statuses/user_timeline', params, function(error, tweets, response_api) {
  if (!error) {
    console.log("tweets", tweets);
  }
  else {
    console.log("error", error);
  }
});
*/

// Twitter API を呼び出す
exports.callTwiterAPI = functions.https.onRequest((request, response) => {
  // 特定のユーザーのツイートを取得する
  var params = {screen_name: 'yagami_360',count:20};
  client.get('statuses/user_timeline', params, function(error, tweets, response_api) {
    if (!error) {
      console.log("tweets", tweets);
    }
    else {
      console.log("error", error);
    }
  });
});
