# VTuber 動画視聴アプリ

- 公開サイト : https://vtuber-video-view-app-6dd4e.web.app/

## ■ 使用法

### 1. 事前準備

1. YouTube Data API の設定<br>
    1. 「[GCP コンソール画面](https://console.cloud.google.com/marketplace/product/google/youtube.googleapis.com?q=search&referrer=search&hl=ja&project=my-project2-303004)」から、"YouTube Data API v3" を有効化する
    1. GCP コンソール画面の「認証情報を作成」ボタンをクリックし、API キーを作成する<br>
        > アクセスするデータの種類には、「一般公開データ」を設定する
    1. 「[GCP コンソール画面](https://console.cloud.google.com/apis/credentials?hl=ja&project=my-project2-303004)」から、作成した API キーの編集アイコンをクリックし、「アプリケーションの制限」項目に「HTTP リファラー（ウェブサイト）」を選択する。また「ウェブサイトの制限」項目のリファラーに、本アプリのトップページの URL 以下 `http://localhost:3000/*`, `https://vtuber-video-view-app-6dd4e.web.app/*` を設定する。
    1. 作成した API キーを React アプリ用環境変数のファイル `vtuber-video-view-app/.env` に設定する<br>
        ```sh
        REACT_APP_YOUTUBE_DATA_API_KEY1=${API_KEY1}
        ```

        > JavaScript のコードで直接 API キーの値を設定すると、GitHub で外部公開する際に値がリークするので、環境変数で管理する。(この .env ファイルは GitHub 管理しないようにする）

        YouTube Data API の１日の利用上限は、10,000 Queries / day になっている。各エンドポイント旅のクエリポイント使用量は、https://developers.google.com/youtube/v3/determine_quota_cost に記載されている。<br>
        API の利用上限に達してしまう場合は、割り当て量の増加申請するか、別の GCP プロジェクトで別の API キーを作成してそれを利用すればよい。<br>

        複数の API キーを利用する場合は、React アプリ用環境変数のファイル `vtuber-video-view-app/.env` にそれぞれ異なる環境変数を設定する<br>
        ```sh
        REACT_APP_YOUTUBE_DATA_API_KEY1=${API_KEY1}
        REACT_APP_YOUTUBE_DATA_API_KEY2=${API_KEY2}
        REACT_APP_YOUTUBE_DATA_API_KEY3=${API_KEY3}
        ...
        ```

    1. `youtube_api/YouTubeDataAPI.tsx` の `YOUTUBE_DATA_API_KEYS` 定数に `vtuber-video-view-app/.env` で定義した環境変数を登録する
        ```python
        const YOUTUBE_DATA_API_KEYS: any[] = [
            process.env["REACT_APP_YOUTUBE_DATA_API_KEY_1"],
        ]
        ```

        複数の　API キーを作成している場合は、以下のように設定すればよい。
        ```python
        const YOUTUBE_DATA_API_KEYS: any[] = [
            process.env["REACT_APP_YOUTUBE_DATA_API_KEY_1"],
            process.env["REACT_APP_YOUTUBE_DATA_API_KEY_2"],
            process.env["REACT_APP_YOUTUBE_DATA_API_KEY_3"],
            ...
        ]
        ```

1. Firebase プロジェクトを作成する<br>
    1. 「[Firebase のコンソール画面](https://console.firebase.google.com/?hl=ja)」から `vtuber-video-view-app` のプロジェクト ID でプロジェクトを作成する。<br>
    1. `vtuber-video-view-app-6dd4e` のアプリケーション名で Web サイトを作成する
    1. "Authentication" を有効化し、ログプロバイダとして Google を追加する<br>
    1. "Firestore Database" の機能を有効する<br>
    1. "Hositing" の機能を有効する<br>
    1. "Functions" の機能を有効する<br>

1. アプリのプロジェクトを作成する<br>
    ```sh
    $ sh create_app.sh
    ```

    > Firebase の初期化時には、"Firestore", "Hosting", "Functions" を有効化して初期化してください

    > FireBase Hosting のディレクトリは、build を指定してください。

### 2. アプリのデバッグ処理

1. アプリを起動する<br>
    ```sh
    $ cd "vtuber-video-view-app"
    $ npm start
    ```

### 3. デプロイ処理（アプリの外部公開）

1. `firebase.json` を以下のように修正する
    ```json
    {
        "firestore": {
            "rules": "firestore.rules",
            "indexes": "firestore.indexes.json"
        },
        "hosting": {
            "rewrites": [ {
                "source": "**",
                "destination": "/index.html"
            } ],
            "public": "build",
            "ignore": [
                "firebase.json",
                "**/.*",
                "**/node_modules/**"
            ]
        }
    }
    ```

    > 本 React アプリは SPA なので、上記の `hosting.rewrites` の部分を設定しないと、ルーティングを行っていないアドレスにアクセスした際に 404 エラーが発生してしまう。そのため、`hosting.rewrites` を設定し、ルーティングが行われていないアドレスにアクセスした際は、ルートページの `index.html` に移動するようにすることで、ルーティングを行っていないアドレスにアクセス出来るようにする必要がある。

1. React アプリをビルドする<br>
    ```sh
    $ cd "vtuber-video-view-app"
    $ npm run build
    ```

1. Firebase Hosting で外部公開する<br>
    ```sh
    $ firebase deploy --project "vtuber-video-view-app"
    ```

1. 外部公開 URL にアクセスする
    ```sh
    $ open https://vtuber-video-view-app-6dd4e.web.app/
    ```

## ■ 参考サイト
