# 動画視聴アプリ

## ■ 使用法

### 1. 事前準備

1. YouTube API の設定<br>
    1. 「[GCP コンソール画面](https://console.cloud.google.com/marketplace/product/google/youtube.googleapis.com?q=search&referrer=search&hl=ja&project=my-project2-303004)」から、"YouTube Data API v3" を有効化する
    1. GCP コンソール画面の「認証情報を作成」ボタンをクリックし、API キーを作成する<br>
        > アクセスするデータの種類には、「一般公開データ」を設定する

    1. 「[GCP コンソール画面](https://console.cloud.google.com/apis/credentials?hl=ja&project=my-project2-303004)」から、作成した API キーの編集アイコンをクリックし、「アプリケーションの制限」項目に「HTTP リファラー（ウェブサイト）」を選択する。また「ウェブサイトの制限」項目のリファラーに、本アプリのトップページの URL 以下 `http://localhost:3000/*`, `https://video-view-app-73d21.web.app/*` を設定する。

    1. 作成した API キーを React アプリ用環境変数のファイル `video-view-app/.env` に設定する<br>
        ```sh
        REACT_APP_YOUTUBE_DATA_API_KEY=${API_KEY}
        ```

        > JavaScript のコードで直接 API キーの値を設定すると、GitHub で外部公開する際に値がリークするので、環境変数で管理する。(この .env ファイルは GitHub 管理しないようにする）

1. Firebase プロジェクトを作成する<br>
    「[Firebase のコンソール画面](https://console.firebase.google.com/?hl=ja)」から `video-view-app-73d21` のプロジェクト ID でプロジェクトを作成する。

    > "Authentication", "Firestore Database", "Hositing" の機能を有効する

1. アプリのプロジェクトを作成する<br>
    ```sh
    $ sh create_app.sh
    ```

    > Firebase の初期化時には、"Firestore", "Hosting", "Function" を有効化して初期化してください

### 2. アプリのデバッグ処理

1. アプリを起動する<br>
    ```sh
    $ cd "video-view-app"
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
    $ cd "video-view-app"
    $ npm run build
    ```

1. Firebase Hosting で外部公開する<br>
    ```sh
    $ firebase deploy --project "video-view-app-73d21"
    ```

1. 外部公開 URL にアクセスする
    ```sh
    $ open https://video-view-app-73d21.web.app/
    ```

## ■ 参考サイト

- https://cly7796.net/blog/javascript/try-using-the-youtube-data-api/
- https://developers.google.com/youtube/v3/docs/?apix=true