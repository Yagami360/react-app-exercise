const AppRoutes = {
  topPage: { index : 0, path : "/" },
  imageSearchPage: { index : 0, path : "/"}, 
  profileSearchPage: { index : 1, path : "/profile_search" },
  timeLinePage: { index : 2, path : "/timeline" },  
  favPage: { index : 3, path : "/fav" },
  testPage: { index : 4, path : "/test" },
};
export default AppRoutes;

export const TopPageConfig = {
  collectionNameSearchWord: "search-word-database",
  cloudFunctionSearchTweetUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweet",
  cloudFunctionSearchUserUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchUser",
  searchCount: 100,
  searchCountProfile: 20,
};

export const ImageSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  cloudFunctionSearchTweetUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweet",
  //cloudFunctionSearchTweetUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweetRecursive",
  searchCount: 100,     // max 100
  searchIter: 1,       // 
  imageHeight: "300px",
  imageWidth: "2000px",
};

export const ProfileSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  cloudFunctionSearchUserUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchUser",
  searchCount: 20,
  imageHeight: 300,
  imageWidth: 2000,
};

export const TimeLinePageConfig = {
  collectionNameFollow: 'follow-database',
  cloudFunctionGetTimelineUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/getUserTimelineTweet",
  searchCount: 50,
  //searchCount: 200,
  imageHeight: "250px",
  imageWidth: "300px",
};

export const FavPageConfig = {
  collectionNameFav: 'fav-tweets-database',
  imageHeight: "200px",
  imageWidth: "1000px",
  gridXs: 3,                  //  画面幅 12 分割に対して１つのカードで使用するグリッド数
};

export const TestPageConfig = {
};