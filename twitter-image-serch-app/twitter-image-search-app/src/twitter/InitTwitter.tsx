import Twitter from "twitter"

/*
console.log("process.env : ", process.env )
console.log("process.env.REACT_APP_TWITTER_CONSUMER_KEY : ", process.env.REACT_APP_TWITTER_CONSUMER_KEY )
console.log("process.env.REACT_APP_TWITTER_CONSUMER_SECRET : ", process.env.REACT_APP_TWITTER_CONSUMER_SECRET )
console.log("process.env.REACT_APP_TWITTER_ACCESS_TOKEN_KEY : ", process.env.REACT_APP_TWITTER_ACCESS_TOKEN_KEY )
console.log("process.env.REACT_APP_TWITTER_ACCESS_SECRET : ", process.env.REACT_APP_TWITTER_ACCESS_SECRET )
*/

const client = new Twitter({
  consumer_key: process.env.REACT_APP_TWITTER_CONSUMER_KEY || "",           // 型が 'string | undefined' なので、"xxx" || "" で初期化
  consumer_secret: process.env.REACT_APP_TWITTER_CONSUMER_SECRET || "",
  access_token_key: process.env.REACT_APP_TWITTER_ACCESS_TOKEN_KEY || "",
  access_token_secret: process.env.REACT_APP_TWITTER_ACCESS_SECRET || "",
})
console.log("client : ", client )

/*
var headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

// 特定のユーザーのツイートを取得する
var params = {screen_name: 'yagami_360',count:20};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets);
  }
});
*/