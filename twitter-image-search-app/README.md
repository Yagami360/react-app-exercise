# Twitter 画像検索アプリ（TypeScript + React + React Hooks での構成）

Twitter-API を用いて、指定したワードを含む画像付きツイートを検索するアプリです。画像付きツイートのお気に入り保存機能や簡易的なフォロー機能もあります。

- 公開サイト : https://twitter-image-search-app.web.app/

## ■ 使用法

### 1. 事前準備

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
    「[Firebase のコンソール画面](https://console.firebase.google.com/?hl=ja)」から `twitter-image-search-app` の名前でプロジェクトを作成する。<br>

    > "Authentication", "Firestore Database", "Hositing", "Functions" の機能を有効する

1. アプリのプロジェクトを作成する<br>
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

### 2. アプリのデバッグ処理

1. アプリを起動する<br>
    ```sh
    $ cd "twitter-image-search-app"
    $ npm start
    ```

### 3. デプロイ処理（アプリの外部公開）

1. `firebase.json` を以下のように修正する。
    ```json
    {
        "firestore": {
            "rules": "firestore.rules",
            "indexes": "firestore.indexes.json"
        },
        "storage": {
            "rules": "storage.rules"
        },
        "hosting": {
            "public": "build"
        }
    }
    ```

1. React アプリをビルドする<br>
    ```sh
    $ cd "twitter-image-search-app"
    $ npm run build
    ```

1. Firebase Hosting で外部公開する<br>
    ```sh
    $ firebase deploy --project "twitter-image-search-app"
    ```

1. 外部公開 URL にアクセスする
    ```sh
    $ open https://twitter-image-search-app.web.app/
    ```

## ■ 参考サイト

- https://syncer.jp/Web/API/Twitter/REST_API/GET/search/tweets/
- https://gist.github.com/cucmberium/e687e88565b6a9ca7039
- https://qiita.com/ryo-a/items/53fe9eadcf719b817c9a
