const AppRoutes = {
  //topPage: { index : -1, path : "/" },
  topPage: { index : -1, path : "/home" },
  //imageSearchPage: { index : 0, path : "/image_search"}, 
  imageSearchPage: { index : 0, path : "/"}, 
  profileSearchPage: { index : 1, path : "/profile_search" },
  timeLinePage: { index : 2, path : "/timeline" },  
  favPage: { index : 3, path : "/fav" },
  testPage: { index : 4, path : "/test" },
};
export default AppRoutes;

export const TopPageConfig = {
  collectionNameSearchWord: "search-word-database",
  searchCount: 100,              // max 100
  searchIter: 10,                // 
  searchCountProfile: 20,        // max 20
  searchIterProfile: 100,        // 
};

export const ImageSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  searchCount: 100,       // max 100
  searchIter: 10,         // 
  imageHeight: "300px",
  imageWidth: "2000px",
};

export const ProfileSearchPageConfig = {
  collectionNameSearchWord: "search-word-database",
  searchCount: 20,        // max 20
  searchIter: 10,         // 
  imageHeight: 300,
  imageWidth: 2000,
};

export const TimeLinePageConfig = {
  collectionNameFollow: 'follow-database',
  searchCount: 50,
  //searchCount: 200,
  searchIter: 2,         // 
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