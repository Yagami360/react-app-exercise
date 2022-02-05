/* eslint-disable */

//============================================
// IFrame Player API の初期化を行うクラス
//============================================
class YouTubeIframeAPI {
  private isLoaded: boolean;
  private isReady: boolean;
  private resolve: ((value: boolean) => void) | null;

  constructor() {
    this.isLoaded = false;
    this.isReady = false;
    this.resolve = null;
  }

  ready() {
    return new Promise(resolve => {
      this.resolve = resolve;

      if (this.isReady) resolve(true);
    });
  }

  onYouTubeIframeAPIReady() {
    this.isReady = true;

    if (this.resolve !== null) {
      this.resolve(true);
    }
  }

  load() {
    console.log('YouTubeIframeAPI - Load');
    if (this.isLoaded) return;
    this.isLoaded = true;

    // YouTube Player API の JavaScript コードを読み込み
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode !== null) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }
}

const youtubeAPI = new YouTubeIframeAPI();

// YouTube Player API の JavaScript コードを読み込まれると呼び出されるコールバック関数 onYouTubeIframeAPIReady に、YouTubeIframeAPI.onYouTubeIframeAPIReady を割り当て
(window as any).onYouTubeIframeAPIReady = youtubeAPI.onYouTubeIframeAPIReady.bind(youtubeAPI);

// YouTube Player API の JavaScript コードを読み込み
youtubeAPI.load();

export default youtubeAPI;
