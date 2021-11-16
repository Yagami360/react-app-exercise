# Twitter 画像検索アプリ（React + React Hooks での構成）

## ■ 使用法

1. Twiter-API を有効化する<br>
  1. [Twitter Application Management](https://developer.twitter.com/en/apps) にアクセスし、Twitter アカウントでログインする<br>
  1. 「Create an app」ボタンをクリックする<br>
  1. 指示に従って各種項目を入力する<br>
      > "Tell us how this app will be used" の回答には、以下のような回答を入力した
      > ```
      > I want to use TwitterAPI to learn how to develop applications using React.
      > Specifically, I want to create an image search application on Twitter as a sample > application for study, and to do so, I need to use the TwitterAPI.
      > ```

  1. API キーを取得する<br>
    API Key と Access Token のキーを取得する。このキーは、Twitter API 初期化時に渡す値になっている
    <img src="https://user-images.githubusercontent.com/25688193/141665748-3ca3a280-eb78-49e8-b33f-28a1ff28f0c3.png" width=500 />

1. Firebase プロジェクトを作成する<br>
  xxx

1. アプリをデプロイする<br>
  ```sh
  $ sh create_app.sh
  ```

1. Cloud Funtion に Twitter API キーを設定する<br>
  ```sh
  PROJECT_NAME="twitter-image-search-app"
  FIREBASE_PROJECT_ID="twitter-image-search-app"

  # firebase Cloud Funtion 内のコードで環境変数を認証できるようする
  cd ${ROOT_DIR}/${PROJECT_NAME}/functions
  firebase functions:config:set ${FIREBASE_PROJECT_ID}.twitter_consumer_key=${twitter_consumer_key}
  firebase functions:config:set ${FIREBASE_PROJECT_ID}.twitter_consumer_secret=${twitter_consumer_secret}
  firebase functions:config:set ${FIREBASE_PROJECT_ID}.twitter_access_token_key=${twitter_access_token_key}
  firebase functions:config:set ${FIREBASE_PROJECT_ID}.twitter_access_secret=${twitter_access_secret}
  firebase functions:config:get > .runtimeconfig.json
  ```

1. アプリを起動する<br>
  ```sh
  $ sh run_app.sh
  ```

## ■ 参考サイト

- https://syncer.jp/Web/API/Twitter/REST_API/GET/search/tweets/
- https://gist.github.com/cucmberium/e687e88565b6a9ca7039

## ■ ToDo

- [ ] メニューバーから「お気に入り」ページと「設定」ページに移動出来るようにする
- [ ] 検索履歴表示機能
- [ ] 右上アイコンでログイン機能
- [ ] ☆ボタンクリック時のお気に入り保存機能
- [ ] 検索ヒット数が少ないバグの修正
- [ ] 無限スクロール機能追加
