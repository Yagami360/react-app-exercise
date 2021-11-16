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

// Twitter API を呼び出す
exports.callTwiterAPI = functions.https.onRequest((request, response) => {
  console.log( "call callTwiterAPI" )

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

  var params = {
    q: request.body["search_word"],
    count : request.body["count"],
  };

  client.get('search/tweets', params, function(error, tweets, response_api) {
    if (!error) {
      console.log("tweets", tweets);
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
