/* eslint-disable */
export const AppConfig = {
  appName: "youtube-video-view-app",
  topPage: { index : 0, path : "/" },
  videoSearchPage: { index : 1, path : "/search" },
  favPage: { index : 2, path : "/fav" },
  followPage: { index : 3, path : "/follow" },
  videoWatchPage: { index : 4, path : "/watch/:video_id"},
};
export default AppConfig

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
  //videoHeight: 720,
  //videoWidth: 1280,
  videoHeight: 840,
  videoWidth: 1493,
  //videoHeight: 1080,
  //videoWidth: 1920,
  autoPlay: 1,
  maxResultsComment: 100,
  iterComment: 2,
  maxResultsChat: 100,
  iterChat: 1,
  intervalTimeChat: 1000,
  maxResultsIntervalChat: 1,
  showLiveChatCanvas: false,
  //showLiveChatCanvas: true,
  chatCanvasMaxRow: 30,
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
