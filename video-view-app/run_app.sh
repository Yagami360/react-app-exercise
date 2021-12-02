#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="video-view-app"
FIREBASE_PROJECT_ID="video-view-app"

cd ${ROOT_DIR}/${PROJECT_NAME}

# 作成した React のプロジェクトのサーバーを起動する
npm start
