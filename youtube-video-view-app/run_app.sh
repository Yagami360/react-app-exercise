#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="youtube-video-view-app"
FIREBASE_PROJECT_ID="video-view-app-684c0"

cd ${ROOT_DIR}/${PROJECT_NAME}

# 作成した React のプロジェクトのサーバーを起動する
npm start
