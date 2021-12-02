#!/bin/sh
set -eu
ROOT_DIR=${PWD}
PROJECT_NAME="video-view-app"
FIREBASE_PROJECT_ID="video-view-app-73d21"

#-----------------------------
# OS判定
#-----------------------------
if [ "$(uname)" = 'Darwin' ]; then
  OS='Mac'
  echo "Your platform is MacOS."  
elif [ "$(expr substr $(uname -s) 1 5)" = 'Linux' ]; then
  OS='Linux'
  echo "Your platform is Linux."  
elif [ "$(expr substr $(uname -s) 1 10)" = 'MINGW32_NT' ]; then                                                                                           
  OS='Cygwin'
  echo "Your platform is Cygwin."  
else
  echo "Your platform ($(uname -a)) is not supported."
  exit 1
fi

#-----------------------------
# npm をインストール
#-----------------------------
if [ ${OS} = "Mac" ] ; then
    if [ ! "brew list | grep node" ] ; then
        brew install node
    fi
fi
npm -v

#-----------------------------
# React のプロジェクトを作成し、起動する
#-----------------------------
# React のプロジェクトを作成
if [ ! -e ${ROOT_DIR}/${PROJECT_NAME} ] ; then
  npx -y create-react-app ${PROJECT_NAME} --template typescript 
fi
cd ${ROOT_DIR}/${PROJECT_NAME}

# 各種 npm パッケージをインストール
npm install --save react-router-dom                       # ルーティング用パッケージ
npm install --save-dev @types/react-router-dom            # ルーティング用パッケージ（TypeScript用）
npm install --save firebase@8.10.0                        # Firebase
npm install --save @material-ui/core                      # Material-UI
npm install --save @material-ui/icons                     # Material-UI
npm install --save @material-ui/lab                       # Material-UI
npm install --save @types/react-beautiful-dnd             # ドラック＆ドロップ用ライブラリ
npm install --save react-beautiful-dnd

npm ls --depth=0

#----------------------------- 
# Firebase のプロジェクトを作成する
#-----------------------------
cd ${ROOT_DIR}/${PROJECT_NAME}

# Firebase CLI のインストール
sudo npm install --save firebase-tools

# Firebase へのログイン
firebase login --project ${FIREBASE_PROJECT_ID}

# Firebase プロジェクトを初期化
firebase init --project ${FIREBASE_PROJECT_ID}

#-----------------------------
# React アプリを起動する
#-----------------------------
# 作成した React のプロジェクトのサーバーを起動する
cd ${ROOT_DIR}/${PROJECT_NAME}
npm start
