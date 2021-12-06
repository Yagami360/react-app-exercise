/* eslint-disable */
export const AppConfig = {
  appName: "youtube-video-view-app",
  topPage: { index : 0, path : "/" },
  videoSearchPage: { index : 1, path : "/video_search" },
  videoWatchPage: { index : 2, path : "/video_watch/:video_id" },
  testPage: { index : 3, path : "/test" },
};
export default AppConfig

export const YouTubeDataAPIConfig = {
  apiKey: process.env["REACT_APP_YOUTUBE_DATA_API_KEY"],
  url: 'https://www.googleapis.com/youtube/v3/',
};

export const TopPageConfig = {
};

export const VideoSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  imageHeight: "300px",
  imageWidth: "2000px",
  maxResults: 10,
  //maxResults: 50,
  iterSearchVideo: 1,
  //iterSearchVideo: 10,  
};

export const VideoWatchPageConfig = {
  //videoHeight: "720",
  //videoWidth: "1280",
  videoHeight: "840",
  videoWidth: "1493",
  //videoHeight: "1080",
  //videoWidth: "1920",
  autoPlay: 1,
  maxResultsComment: 100,
  iterComment: 2,
  maxResultsChat: 100,
  iterChat: 2,
  intervalTimeChat: 100,
  maxResultsIntervalChat: 10,
};
