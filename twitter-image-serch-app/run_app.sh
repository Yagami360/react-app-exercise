#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="twitter-image-search-app"
FIREBASE_PROJECT_ID="twitter-image-search-app"

cd ${ROOT_DIR}/${PROJECT_NAME}

# Cloud Funtion をデプロイ
firebase deploy --project ${FIREBASE_PROJECT_ID} --only functions
firebase functions:log --only callTwiterAPI

# 作成した React のプロジェクトのサーバーを起動する
npm start
