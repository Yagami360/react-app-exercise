export const AppConfig = {
  appName: "video-view-app",
  topPage: { index : 0, path : "/" },
  testPage: { index : 1, path : "/test" },
};
export default AppConfig

export const YouTubeDataAPIConfig = {
  apiKey: process.env["REACT_APP_YOUTUBE_DATA_API_KEY"],
  url: 'https://www.googleapis.com/youtube/v3/',
};

export const TopPageConfig = {
  collectionNameSearchWord: "search-word-database",
  imageHeight: "300px",
  imageWidth: "2000px",
};

