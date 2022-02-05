/* eslint-disable */
const CLOUDFUNTION_SERACH_TWEET_URL = "https://us-central1-vtuber-video-view-app-6dd4e.cloudfunctions.net/searchTweet"
const CLOUDFUNTION_SERACH_USER_URL = "https://us-central1-vtuber-video-view-app-6dd4e.cloudfunctions.net/searchUser"
const CLOUDFUNTION_GET_USER_TIMELINE_TWEET_URL = "https://us-central1-vtuber-video-view-app-6dd4e.cloudfunctions.net/getUserTimelineTweet"

//--------------------------------------------------------
// 指定の文字列を含む画像つきツイートを再帰的に取得する
// searchCount : （max 100）
//--------------------------------------------------------
export async function searchImageTweetsRecursive(
  twitter_consumer_key:string, twitter_consumer_secret: string, twitter_access_token_key: string, twitter_access_secret: string,
  searchWord: string, searchCount: number = 100, searchIter: number = 1, maxId: string = ""
) {
  let tweets: any = {
    "statuses": [],
    "search_metadata": undefined,
  }

  for (let i = 0; i < searchIter; i++) {
    try {
      // Promise ではなく aync/await 形式で非同期処理
      const response = await fetch(
        CLOUDFUNTION_SERACH_TWEET_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "twitter_consumer_key" : twitter_consumer_key,
            "twitter_consumer_secret" : twitter_consumer_secret,
            "twitter_access_token_key" : twitter_access_token_key,
            "twitter_access_secret" : twitter_access_secret,
            "search_word" : searchWord + " filter:images",
            "count": searchCount,
            "max_id": maxId,
          })
        }
      )
  
      // レスポンスデータ取得
      const data = await response.json()
      if( data["status"] == "ng" ) {
        break
      }

      const tweets_ = data["tweets"]
      tweets["statuses"] = tweets["statuses"].concat(tweets_["statuses"])
      tweets["search_metadata"] = tweets_["search_metadata"]

      // 100 件以上の場合は、search_metadata に 100 件以降のツイートの情報が入る     
      const next_results = tweets_["search_metadata"]["next_results"]
      //console.log( "next_results : ", next_results )
      if ( next_results === undefined || next_results === "" ) {
        break
      }
      else {
        maxId = next_results.split("&")[0].split("?max_id=")[1];
        //console.log( "maxId : ", maxId )
        if( maxId === null ) {
          break
        }
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  return [tweets, maxId]
}

//--------------------------------------------------------
// プロフィール文に指定の文字列を含むユーザー一覧を再帰的に取得する
// searchCount : （max 20）
//--------------------------------------------------------
export async function searchUsersRecursive(
  twitter_consumer_key:string, twitter_consumer_secret: string, twitter_access_token_key: string, twitter_access_secret: string,
  searchWord: string, searchCount: number = 20, searchIter: number = 1, page: number = 1
) {
  let users: any = []
  for (let i = 0; i < searchIter; i++) {
    console.log( "[searchUsersRecursive] page : ", page )
    try {
      // Promise ではなく aync/await 形式で非同期処理
      const response = await fetch(
        CLOUDFUNTION_SERACH_USER_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "twitter_consumer_key" : twitter_consumer_key,
            "twitter_consumer_secret" : twitter_consumer_secret,
            "twitter_access_token_key" : twitter_access_token_key,
            "twitter_access_secret" : twitter_access_secret,
            "search_word" : searchWord,
            "count": searchCount,
            "page": page,
          })
        }
      )

      page += 1

      // レスポンスデータ取得
      const data = await response.json()
      if( data["status"] == "ng" ) {
        break
      }

      const users_ = data["users"]
      //console.log("users_ : ", users_)
      users = users.concat(users_)
    }
    catch (err) {
      console.error(err);
    }
  }

  return [users, page]
}

//--------------------------------------------------------
// ユーザーのタイムラインツイートを再帰的に取得する
// searchCount : （max 20）
//--------------------------------------------------------
export async function getUserTimelineTweetsRecursive(
  twitter_consumer_key:string, twitter_consumer_secret: string, twitter_access_token_key: string, twitter_access_secret: string,
  userId: string, searchCount: number = 20, include_rts:boolean = true, exclude_replies:boolean = false, searchIter: number = 1, maxId: any = undefined
) {
  let tweets: any = []
  for (let i = 0; i < searchIter; i++) {
    try {
      // Promise ではなく aync/await 形式で非同期処理
      // フォローユーザーのツイートをタイムラインで取得
      const response = await fetch(
        CLOUDFUNTION_GET_USER_TIMELINE_TWEET_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "twitter_consumer_key" : twitter_consumer_key,
            "twitter_consumer_secret" : twitter_consumer_secret,
            "twitter_access_token_key" : twitter_access_token_key,
            "twitter_access_secret" : twitter_access_secret,
            "user_id": userId,
            "count": searchCount,
            "max_id": maxId,
            "include_rts": include_rts,
            "exclude_replies": exclude_replies,
          })
        }
      )

      // レスポンスデータ取得
      const data = await response.json()
      //console.log( "data : ", data )
      if( data["status"] == "ng" ) {
        break
      }

      const tweets_ = data["tweets"]
      //console.log( "tweets_ : ", tweets_ )
      tweets = tweets.concat(tweets_)

      // max_id を取得して繰り返し検索
      maxId = tweets_[tweets_.length - 1]["id"]
      //maxId = tweets_[tweets_.length - 1]["id_str"]
      //console.log( "maxId : ", maxId )
      if( maxId === null || maxId === "" ) {
        break
      }
    }
    catch (err) {
      console.error(err);
    }      
  }

  return [tweets, maxId]
}
