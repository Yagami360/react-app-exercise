#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="image-search-app"

# 作成した React のプロジェクトのサーバーを起動する
cd ${ROOT_DIR}/${PROJECT_NAME}
npm ls --depth=0
npm start
