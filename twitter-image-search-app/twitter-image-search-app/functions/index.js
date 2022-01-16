const functions = require("firebase-functions");
const Twitter = require('twitter');                 // Twitter for Node.js

const config = functions.config()
const env = config["twitter-image-search-app"]
//console.log('config : ', config )
//console.log('env : ', env )

const client = new Twitter({
  consumer_key: env.twitter_consumer_key,
  consumer_secret: env.twitter_consumer_secret,
  access_token_key: env.twitter_access_token_key,
  access_token_secret: env.twitter_access_secret,
})
//console.log("client : ", client )

//---------------------------------------------
// Twitter API を使用して指定したワードのツイートを検索する Cloud Funtion
// request.body["search_word"] : 検索クエリ
// request.body["count"] : 検索数（最大100件）
//---------------------------------------------
exports.searchTweet = functions.https.onRequest((request, response) => {
  console.log( "call searchTweet" )

  // リクエストデータ解析
  //functions.logger.info("request : ", request);
  //functions.logger.info("request.body : ", request.body);

  // CORS 設定（この処理を入れないと Cloud Funtion 呼び出さ元で No 'Access-Control-Allow-Origin' のエラーが出る）
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      response.set('Access-Control-Allow-Methods', 'GET');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
      response.set('Access-Control-Max-Age', '3600');
      response.status(204).send('');
  }

  // Twitter API へのリクエスト処理
  var params = {
    q: request.body["search_word"],
    count : request.body["count"],
    max_id: request.body["max_id"],                   // ツイートのIDを指定すると、これを含まず、これより過去のツイートを取得できる。
  };
  client.get('search/tweets', params, function(error, tweets, response_api) {
    if (!error) {
      // レスポンス処理
      response.send(
        JSON.stringify({
            "status": "ok",
            "tweets" : tweets,                
        })
      );
    }
    else {
      console.log("error", error);
      // レスポンス処理
      response.send(
        JSON.stringify({
            "status": "ng",
            "tweets" : undefined,                
        })
      );
    }
  });
});

//---------------------------------------------
// Twitter API を使用して特定のユーザーのツイートを取得する Cloud Funtion
// request.body["screen_name"] : 検索対象のユーザー名（@なし）
// request.body["count"] : 検索数（最大100件）
//---------------------------------------------
exports.getUserTimelineTweet = functions.https.onRequest((request, response) => {
  console.log( "call getUserTimelineTweet" )

  // CORS 設定（この処理を入れないと Cloud Funtion 呼び出さ元で No 'Access-Control-Allow-Origin' のエラーが出る）
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      response.set('Access-Control-Allow-Methods', 'GET');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
      response.set('Access-Control-Max-Age', '3600');
      response.status(204).send('');
  }

  // Twitter API へのリクエスト処理
  var params = {
    user_id: request.body["user_id"],
    count : request.body["count"],
    max_id : request.body["max_id"],
    include_rts: request.body["include_rts"],           // リツイートを含めるか否か。
    exclude_replies: request.body["exclude_replies"],   // リプライを除外するか。trueなら除外する、falseなら除外しない。
  };
  console.log( "params : ", params )

  // Twitter for Node.js では、screen_name でツイートを取得できないことに注意。
  client.get('statuses/user_timeline', params, function(error, tweets, response_api) {
  if (!error) {
      //console.log( "tweets : ", tweets )

      // レスポンス処理
      response.send(
        JSON.stringify({
            "status": "ok",
            "tweets" : tweets,                
        })
      );
    }
    else {
      console.log("error", error);
      // レスポンス処理
      response.send(
        JSON.stringify({
            "status": "ng",
            "tweets" : undefined,                
        })
      );
    }
  });
});

//---------------------------------------------
// Twitter API を使用して指定したワードを含むツイートを検索する Cloud Funtion
// request.body["search_word"] : 検索クエリ
// request.body["count"] : 検索数（最大100件）
//---------------------------------------------
exports.searchUser = functions.https.onRequest((request, response) => {
  console.log( "call searchUser" )

  // CORS 設定（この処理を入れないと Cloud Funtion 呼び出さ元で No 'Access-Control-Allow-Origin' のエラーが出る）
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      response.set('Access-Control-Allow-Methods', 'GET');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
      response.set('Access-Control-Max-Age', '3600');
      response.status(204).send('');
  }

  // Twitter API へのリクエスト処理
  var params = {
    q: request.body["search_word"],
    count : request.body["count"],
    page : request.body["page"],
  };
  client.get('users/search', params, function(error, users, response_api) {
    if (!error) {
      // レスポンス処理
      response.send(
        JSON.stringify({
            "status": "ok",
            "users" : users,                
        })
      );
    }
    else {
      console.log("error", error);
      // レスポンス処理
      response.send(
        JSON.stringify({
            "status": "ng",
            "users" : undefined,                
        })
      );
    }
  });
});