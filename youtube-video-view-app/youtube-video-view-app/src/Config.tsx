/* eslint-disable */
export const AppConfig = {
  appName: "youtube-video-view-app",
  topPage: { index : 0, path : "/" },
  videoSearchPage: { index : 1, path : "/search" },
  videoWatchPage: { index : 2, path : "/watch/:video_id"},
  //videoWatchPage: { index : 2, path : "/watch/*"},
  favPage: { index : 3, path : "/fav" },
  followPage: { index : 4, path : "/follow" },
  testPage: { index : 5, path : "/test" },
};
export default AppConfig

export const TopPageConfig = {
};

export const VideoSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  imageHeight: "300px",
  imageWidth: "2000px",
  maxResults: 20,
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
  iterChat: 1,
  intervalTimeChat: 10000,
  maxResultsIntervalChat: 1,
};

export const FavPageConfig = {
  collectionNameFav: 'fav-video-database',
  imageHeight: "300px",
  imageWidth: "2000px",
  gridXs: 3,                  //  画面幅 12 分割に対して１つのカードで使用するグリッド数
};

export const FollowPageConfig = {
  collectionNameFollow: 'follow-database',
};
