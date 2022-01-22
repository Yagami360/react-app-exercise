#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="youtube-video-view-app"
FIREBASE_PROJECT_ID="video-view-app-684c0"

cd ${ROOT_DIR}/${PROJECT_NAME}

# Cloud Funtion をデプロイ
#firebase deploy --project ${FIREBASE_PROJECT_ID} --only functions

# Fisestore Securty rule を更新
#firebase deploy --only firestore:rules

# 作成した React のプロジェクトのサーバーを起動する
npm start
