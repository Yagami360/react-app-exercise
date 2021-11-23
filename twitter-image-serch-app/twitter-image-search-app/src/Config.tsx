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
  searchCount: 100,
};

export const ProfileSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  cloudFunctionSearchUserUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchUser",
  searchCount: 20,
};

export const TimeLinePageConfig = {
  collectionNameFollow: 'follow-database',
  cloudFunctionGetTimelineUrl: "https://us-central1-twitter-image-search-app.cloudfunctions.net/getUserTimelineTweet",
  searchCount: 50,
  //searchCount: 200,
};

export const FavPageConfig = {
  collectionNameFav: 'fav-tweets-database',
};

export const TestPageConfig = {
};