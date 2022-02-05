/* eslint-disable */
export const AppConfig = {
  appName: "vtuber-video-view-app",
  title: "Vtuber Video View App",
  topPage: { index : 0, path : "/" },
  vtuberSearchPage: { index : 1, path : "/search_vtuber" },
  videoSearchPage: { index : 2, path : "/search_video" },
  favVideoPage: { index : 3, path : "/fav_video" },
  favVTuberPage: { index : 4, path : "/fav_vtuber" },
  videoWatchPage: { index : 5, path : "/watch/:video_id"},
};
export default AppConfig

export const TopPageConfig = {
};

export const VTuberSearchPageConfig = {
  collectionNameVTuber: "vtuber-database",
  collectionNameSearchWord: "vtuber-search-word-database",
  maxResults: 5,          // VTuber 検索数（最大50）
  //maxResults: 50,
  iterSearchVideo: 1,     // VTuber 検索の繰り返し回数
};

export const VideoSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  imageHeight: "300px",
  imageWidth: "2000px",
  maxResults: 5,          // 動画検索数（最大50）
  //maxResults: 50,
  iterSearchVideo: 1,     // 動画検索の繰り返し回数
  //iterSearchVideo: 2,  
  maxResultsScroll: 4,    // 無限スクロール時の追加検索数
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

export const FavVideoPageConfig = {
  collectionNameFav: 'fav-video-database',
  imageHeight: "300px",
  imageWidth: "2000px",
  gridXs: 3,                  //  画面幅 12 分割に対して１つのカードで使用するグリッド数
};

export const FavVTuberPageConfig = {
  collectionNameFollow: 'fav-vtuber-database',
  maxResults: 5,            // 各チャンネル詳細 body での動画一覧数（最大50）
  //maxResults: 50,
  iterSearchVideo: 1,       // 動画検索の繰り返し回数
  maxResultsScroll: 1,      // 無限スクロール時の追加検索数
  maxResultsAll: 1,         // 全チャンネル詳細 body での各チャンネルの動画一覧数
  //iterSearchVideo: 10,  
  imageHeight: "300px",
  imageWidth: "2000px",
};
