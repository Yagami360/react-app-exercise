# YouTube 動画視聴アプリ（TypeScript + React + React Hooks での構成）

## ■ 使用法

### 1. 事前準備

1. YouTube Data API の設定<br>
    1. 「[GCP コンソール画面](https://console.cloud.google.com/marketplace/product/google/youtube.googleapis.com?q=search&referrer=search&hl=ja&project=my-project2-303004)」から、"YouTube Data API v3" を有効化する
    1. GCP コンソール画面の「認証情報を作成」ボタンをクリックし、API キーを作成する<br>
        > アクセスするデータの種類には、「一般公開データ」を設定する
    1. 「[GCP コンソール画面](https://console.cloud.google.com/apis/credentials?hl=ja&project=my-project2-303004)」から、作成した API キーの編集アイコンをクリックし、「アプリケーションの制限」項目に「HTTP リファラー（ウェブサイト）」を選択する。また「ウェブサイトの制限」項目のリファラーに、本アプリのトップページの URL 以下 `http://localhost:3000/*`, `https://video-view-app-684c0.web.app/*` を設定する。
    1. 作成した API キーを React アプリ用環境変数のファイル `youtube-video-view-app/.env` に設定する<br>
        ```sh
        REACT_APP_YOUTUBE_DATA_API_KEY=${API_KEY}
        ```

        > JavaScript のコードで直接 API キーの値を設定すると、GitHub で外部公開する際に値がリークするので、環境変数で管理する。(この .env ファイルは GitHub 管理しないようにする）

1. Firebase プロジェクトを作成する<br>
    「[Firebase のコンソール画面](https://console.firebase.google.com/?hl=ja)」から `video-view-app-684c0` のプロジェクト ID でプロジェクトを作成する。

    > "Authentication", "Firestore Database", "Hositing" の機能を有効する

1. アプリのプロジェクトを作成する<br>
    ```sh
    $ sh create_app.sh
    ```

    > Firebase の初期化時には、"Firestore", "Hosting", "Function" を有効化して初期化してください

    > FireBase Hosting のディレクトリは、build を指定してください。

### 2. アプリのデバッグ処理

1. アプリを起動する<br>
    ```sh
    $ cd "video-view-app"
    $ npm start
    ```

### 3. デプロイ処理（アプリの外部公開）

1. React アプリをビルドする<br>
    ```sh
    $ cd "youtube-video-view-app"
    $ npm run build
    ```

1. Firebase Hosting で外部公開する<br>
    ```sh
    $ firebase deploy --project "video-view-app-684c0"
    ```

1. 外部公開 URL にアクセスする
    ```sh
    $ open https://video-view-app-684c0.web.app/
    ```

## ■ 参考サイト

- YouTube Data API
    - https://developers.google.com/youtube/v3/docs/?apix=true
    - https://cly7796.net/blog/javascript/try-using-the-youtube-data-api/
    - https://qiita.com/koki_develop/items/4cd7de3898dae2c33f20#youtube-%E5%8B%95%E7%94%BB%E3%82%92%E6%A4%9C%E7%B4%A2%E3%81%99%E3%82%8B
    - https://qiita.com/yaju/items/3bec88dbd544502e1343

- IFrame Player API / YouTube Player API
    - https://developers.google.com/youtube/player_parameters?hl=ja
    - https://qiita.com/rei67/items/25fa4a069157fd6c34b4#%E6%BA%96%E5%82%9

- YouTube Live Streaming API
    - https://developers.google.com/youtube/v3/live/docs
    - 