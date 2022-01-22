/* eslint-disable */
const CLOUDFUNTION_SERACH_TWEET_URL = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweet"
const CLOUDFUNTION_SERACH_USER_URL = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchUser"
const CLOUDFUNTION_GET_USER_TIMELINE_TWEET_URL = "https://us-central1-twitter-image-search-app.cloudfunctions.net/getUserTimelineTweet"

//--------------------------------------------------------
// 指定の文字列を含む画像つきツイートを再帰的に取得する
// searchCount : （max 100）
//--------------------------------------------------------
export async function searchImageTweetsRecursive(searchWord: string, searchCount: number = 100, searchIter: number = 1, maxId: string = "") {
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
export async function searchUsersRecursive(searchWord: string, searchCount: number = 20, searchIter: number = 1) {
  let users: any = []
  let page = 0

  for (let i = 0; i < searchIter; i++) {
    page = i + 1
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
            "search_word" : searchWord,
            "count": searchCount,
            "page": page,
          })
        }
      )

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

  return users
}

//--------------------------------------------------------
// ユーザーのタイムラインツイートを再帰的に取得する
// searchCount : （max 20）
//--------------------------------------------------------
export async function getUserTimelineTweetsRecursive(userId: string, searchCount: number = 20, include_rts:boolean = true, exclude_replies:boolean = false, searchIter: number = 1) {
  let tweets: any = []
  let maxId: any = undefined

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

  return [tweets,maxId]
}
