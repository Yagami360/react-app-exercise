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
  //maxResults: 2,
  maxResults: 50,
  iterSearchVideo: 2,
};

export const VideoWatchPageConfig = {
  //videoHeight: "1080",
  //videoWidth: "1920",
  videoHeight: "720",
  videoWidth: "1280",
  autoPlay: 1,
  maxResultsComment: 100,
  iterComment: 2,
  maxResultsChat: 100,
  iterChat: 2,
};