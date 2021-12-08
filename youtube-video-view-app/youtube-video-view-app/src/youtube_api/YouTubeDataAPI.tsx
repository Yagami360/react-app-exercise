/* eslint-disable */

const YOUTUBE_DATA_API_URL = 'https://www.googleapis.com/youtube/v3/'
const YOUTUBE_DATA_API_KEYS: any[] = [
  process.env["REACT_APP_YOUTUBE_DATA_API_KEY_1"],
  process.env["REACT_APP_YOUTUBE_DATA_API_KEY_2"],
  process.env["REACT_APP_YOUTUBE_DATA_API_KEY_3"],
]

//--------------------------------------------------------
// YouTubeAPI キーを取得する
//--------------------------------------------------------
export function getAPIKey() {
  YOUTUBE_DATA_API_KEYS.length
  // YouTube Data API の１日の利用上限 10,000 Queries / day を回避するために、複数の API キーからランダムに取得した API キーを返す
  let index = Math.floor(Math.random() * YOUTUBE_DATA_API_KEYS.length)
  //console.log( "[getAPIKey] index : ", index )
  return YOUTUBE_DATA_API_KEYS[index]
}

//--------------------------------------------------------
// YouTubeAPI を使用して動画IDからチャンネルIDを取得する非同期関数
//--------------------------------------------------------
export async function getChannelIdFromVideoId(apiKey: any, videoId: any) {
  let channelId = undefined
  if( videoId !== undefined && videoId !== "") {
    // YouTube Data API を使用して動画情報を取得
    try {
      // Promise ではなく aync/await 形式で非同期処理
      const response = await fetch(YOUTUBE_DATA_API_URL+"videos" + '?key='+apiKey + '&part=snippet' + '&maxResults=1' + '&id='+videoId )
      const dataVideos = await response.json()
      //console.log("dataVideos : ", dataVideos)
      channelId = dataVideos["items"][0]["snippet"]["channelId"]
    }
    catch (err) {
      console.error(err);
    }
  }
  return channelId
}

//--------------------------------------------------------
// YouTubeAPI を使用してチャンネル情報する関数
//--------------------------------------------------------
export async function getChannelInfo(apiKey: any, channelId: any) {
  let channelInfo = {
    "channelId": channelId,
    "title": undefined,
    "profileImageUrl": undefined,
    "subscriberCount": undefined
  }

  if( channelId !== undefined && channelId !== "") {
    try {
      const response = await fetch(YOUTUBE_DATA_API_URL+"channels" + '?key='+apiKey + '&part=snippet,statistics' + '&id='+channelId )
      const dataChannels = await response.json()
      //console.log("dataChannels : ", dataChannels)
      channelInfo["title"] = dataChannels["items"][0]["snippet"]["title"]
      channelInfo["profileImageUrl"] = dataChannels["items"][0]["snippet"]["thumbnails"]["medium"]["url"]
      channelInfo["subscriberCount"] = dataChannels["items"][0]["statistics"]["subscriberCount"]
    }
    catch (err) {
      console.error(err);
    }    
  }

  return channelInfo
}

//--------------------------------------------------------
// YouTubeAPI を使用して動画情報を返す非同期関数
//--------------------------------------------------------
export async function getVideoInfo(apiKey: any, videoId: any) {
  let videoInfo = {
    "videoId": videoId,
    "title": undefined,
    "publishedAt": undefined,
    "description": undefined,
    "categoryId": undefined,
    "tags": [],
    "viewCount": undefined,
    "likeCount": undefined,
    "dislikeCount": undefined,
    "favoriteCount": undefined,

    "liveBroadcastContent": undefined,
    "concurrentViewers": undefined,
    "activeLiveChatId": undefined,
  }

  if( videoId !== undefined && videoId !== "") {
    try {
      const response = await fetch(YOUTUBE_DATA_API_URL+"videos" + '?key='+apiKey + '&part=snippet,statistics,liveStreamingDetails,topicDetails' + '&maxResults=1' + '&id='+videoId )
      const dataVideos = await response.json()
      //console.log("dataVideos : ", dataVideos)

      // 動画情報を取得
      videoInfo["title"] = dataVideos["items"][0]["snippet"]["title"]
      videoInfo["publishedAt"] = dataVideos["items"][0]["snippet"]["publishedAt"]
      videoInfo["description"] = dataVideos["items"][0]["snippet"]["description"]
      videoInfo["categoryId"] = dataVideos["items"][0]["snippet"]["categoryId"]
      videoInfo["tags"] = dataVideos["items"][0]["snippet"]["tags"]
      videoInfo["viewCount"] = dataVideos["items"][0]["statistics"]["viewCount"]
      videoInfo["likeCount"] = dataVideos["items"][0]["statistics"]["likeCount"]
      videoInfo["dislikeCount"] = dataVideos["items"][0]["statistics"]["dislikeCount"]
      videoInfo["favoriteCount"] = dataVideos["items"][0]["statistics"]["favoriteCount"]

      // チャット情報を取得
      videoInfo["liveBroadcastContent"] = dataVideos["items"][0]["snippet"]["liveBroadcastContent"]
      if ( videoInfo["liveBroadcastContent"] !== undefined && videoInfo["liveBroadcastContent"] !== "none" ) {
        videoInfo["concurrentViewers"] = dataVideos["items"][0]["liveStreamingDetails"]["concurrentViewers"]
        videoInfo["activeLiveChatId"] = dataVideos["items"][0]["liveStreamingDetails"]["activeLiveChatId"]
      }
    }
    catch (err) {
      console.error(err);
    }    
  }

  return videoInfo
}

//--------------------------------------------------------
// YouTubeAPI を使用して動画カテゴリを返す非同期関数
//--------------------------------------------------------
export async function getVideoCategoryInfo(apiKey: any, categoryId: any) {
  let videoCategoryInfo = {
    "categoryId": categoryId,
    "title": undefined,
  }

  if( categoryId !== undefined && categoryId !== "") {
    try {
      const response = await fetch(YOUTUBE_DATA_API_URL+"videoCategories" + '?key='+apiKey + '&part=snippet' + '&id='+categoryId )
      const dataVideoCategories = await response.json()
      //console.log("dataVideoCategories : ", dataVideoCategories)

      // 動画情報を取得
      videoCategoryInfo["title"] = dataVideoCategories["items"][0]["snippet"]["title"]
    }
    catch (err) {
      console.error(err);
    }    
  }

  return videoCategoryInfo
}

//--------------------------------------------------------
// YouTubeAPI を使用して動画のコメント情報を返す非同期関数
//--------------------------------------------------------
export async function getVideoCommentInfos(apiKey: any, videoId: any, maxResults:Number = 100, iter: Number = 1, nextPageToken: any = "" ) {
  let videoCommentInfos: any = []
  let commentsNumber = undefined
  if( videoId !== undefined && videoId !== "") {
    for (let i = 0; i < iter; i++) {
      try {
        const response = await fetch(YOUTUBE_DATA_API_URL+"commentThreads" + '?key='+apiKey + '&part=snippet,replies' + '&videoId='+videoId + '&maxResults='+maxResults + '&pageToken='+nextPageToken)
        const dataCommentThreads = await response.json()
        //console.log("dataCommentThreads : ", dataCommentThreads)
        nextPageToken = dataCommentThreads["nextPageToken"]
        commentsNumber = dataCommentThreads["pageInfo"]["totalResults"]

        dataCommentThreads["items"].forEach((itemCommentThread: any)=> {
          videoCommentInfos.push({
            "commentId": itemCommentThread["id"],
            "textDisplay": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["textDisplay"],
            "publishedAt": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["publishedAt"],
            "likeCount": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["likeCount"],
            "authorDisplayName": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorDisplayName"],
            "authorProfileImageUrl": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorProfileImageUrl"],
            "authorChannelId": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorChannelId"],
            "authorChannelUrl": itemCommentThread["snippet"]["topLevelComment"]["snippet"]["authorChannelUrl"],
          })
        })      
      }
      catch (err) {
        console.error(err);
      }
    }    
  }

  return [videoCommentInfos, commentsNumber]
}

//--------------------------------------------------------
// YouTubeAPI を使用してライブチャット情報を返す非同期関数
//--------------------------------------------------------
export async function getVideoChatInfos(apiKey: any, liveChatId: any, maxResults:Number = 100, iter: Number = 1, nextPageToken: any = "" ) {
  let videoChatInfos: any = []
  let chatNumber = undefined

  if( liveChatId !== undefined && liveChatId !== "") {
    for (let i = 0; i < iter; i++) {
      try {
        const response = await fetch(YOUTUBE_DATA_API_URL+"liveChat/messages" + '?key='+apiKey + '&part=snippet,authorDetails' + '&liveChatId='+liveChatId + '&maxResults='+maxResults + '&pageToken='+nextPageToken)
        const dataLiveChatMessages = await response.json()
        //console.log("dataLiveChatMessages : ", dataLiveChatMessages)

        nextPageToken = dataLiveChatMessages["nextPageToken"]
        chatNumber = dataLiveChatMessages["pageInfo"]["totalResults"]

        dataLiveChatMessages["items"].forEach((itemLiveChatMessage: any)=> {
          videoChatInfos.push({
            "liveChatId": liveChatId,
            "displayName": itemLiveChatMessage["authorDetails"]["displayName"],
            "channelId": itemLiveChatMessage["authorDetails"]["channelId"],
            "channelUrl": itemLiveChatMessage["authorDetails"]["channelUrl"],
            "profileImageUrl": itemLiveChatMessage["authorDetails"]["profileImageUrl"],
            "publishedAt": itemLiveChatMessage["snippet"]["publishedAt"],
            "displayMessage": itemLiveChatMessage["snippet"]["displayMessage"],
          })
        })      
      }
      catch (err) {
        console.error(err);
      }    
    }
  }

  return [videoChatInfos, chatNumber, nextPageToken]
}

//--------------------------------------------------------
// YouTubeAPI を使用して動画検索結果を返す非同期関数
//--------------------------------------------------------
export async function searchVideos(apiKey: any, searchWord: any, maxResults:Number = 50, iter: Number = 1, nextPageToken: any = "") {
  let searchVideoInfos: any = []
  let totalNumber = undefined
  let searchNumber = 0
  if( searchWord !== undefined && searchWord !== "") {
    for (let i = 0; i < iter; i++) {
      try {
        //console.log("nextPageToken : ", nextPageToken)
        const response = await fetch(YOUTUBE_DATA_API_URL+"search" + '?key='+apiKey + '&type=video' + '&part=snippet' + '&q='+searchWord + '&maxResults='+maxResults + '&pageToken='+nextPageToken)
        const dataSearch = await response.json()
        //console.log("dataSearch : ", dataSearch)
        nextPageToken = dataSearch["nextPageToken"]
        totalNumber = dataSearch["pageInfo"]["totalResults"]
  
        dataSearch["items"].forEach((itemSearch: any)=> {
          searchVideoInfos.push({
            "channelId": itemSearch["snippet"]["channelId"],
            "channelTitle": itemSearch["snippet"]["channelTitle"],
            "videoId": itemSearch["id"]["videoId"],
            "title": itemSearch["snippet"]["title"],
            "publishTime": itemSearch["snippet"]["publishTime"],
            "thumbnailsHightUrl": itemSearch["snippet"]["thumbnails"]["high"]["url"],
            "liveBroadcastContent": itemSearch["snippet"]["liveBroadcastContent"],
          })
          searchNumber += 1
        })      
      }
      catch (err) {
        console.error(err);
      }
    }   
  }
  
  return [searchVideoInfos, totalNumber, searchNumber, nextPageToken]
}




