/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'
import { YouTubeDataAPIConfig } from '../Config'

//--------------------------------------------------------
// YouTubeAPI を使用して動画IDからチャンネルIDを取得する非同期関数
//--------------------------------------------------------
export async function getChannelIdFromVideoId(videoId: any) {
  let channelId = undefined
  if( videoId !== undefined && videoId !== "") {
    // YouTube Data API を使用して動画情報を取得
    try {
      // Promise ではなく aync/await 形式で非同期処理
      const response = await fetch(YouTubeDataAPIConfig.url+"videos" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet' + '&maxResults=1' + '&id='+videoId )
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
export async function getChannelInfo(channelId: any) {
  let channelInfo = {
    "channelId": channelId,
    "title": undefined,
    "profileImageUrl": undefined,
    "subscriberCount": undefined
  }

  if( channelId !== undefined && channelId !== "") {
    try {
      const response = await fetch(YouTubeDataAPIConfig.url+"channels" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet,statistics' + '&id='+channelId )
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

// YouTubeAPI を使用して動画情報を返す非同期関数
export async function getVideoInfo(videoId: any) {
  let videoInfo = {
    "videoId": videoId,
    "title": undefined,
    "publishedAt": undefined,
    "description": undefined,
    "categoryId": undefined,
    "tags": undefined,
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
      const response = await fetch(YouTubeDataAPIConfig.url+"videos" + '?key='+YouTubeDataAPIConfig.apiKey + '&part=snippet,statistics,liveStreamingDetails,topicDetails' + '&maxResults=1' + '&id='+videoId )
      const dataVideos = await response.json()
      console.log("dataVideos : ", dataVideos)

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
      videoInfo["concurrentViewers"] = dataVideos["items"][0]["liveStreamingDetails"]["concurrentViewers"]
      videoInfo["activeLiveChatId"] = dataVideos["items"][0]["liveStreamingDetails"]["activeLiveChatId"]

    }
    catch (err) {
      console.error(err);
    }    
  }

  return videoInfo
}

// YouTubeAPI を使用して動画検索結果を返す非同期関数



