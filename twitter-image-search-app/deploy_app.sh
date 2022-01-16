#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="twitter-image-search-app"
FIREBASE_PROJECT_ID="twitter-image-search-app"

cd ${ROOT_DIR}/${PROJECT_NAME}

# 作成した React のプロジェクトをビルドする
npm run build

# Firebase Hosting で外部公開する 
firebase deploy --project ${FIREBASE_PROJECT_ID}

# 外部公開サイトにアクセスする
open https://${FIREBASE_PROJECT_ID}.web.app/
