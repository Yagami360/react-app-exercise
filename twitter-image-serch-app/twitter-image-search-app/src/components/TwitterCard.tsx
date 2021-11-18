import React from 'react';
import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";

import firebase from "firebase";
import '../firebase/initFirebase'

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { CardMedia } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';
import StarIcon from '@material-ui/icons/Star';
import Avatar from '@material-ui/core/Avatar'

import useLocalPersist from './LocalPersist';

//-----------------------------------------------
// ツイートをカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// コンポーネントの引数
type Props = {
  userName: string;
  userScreenName: string;
  profileImageUrl: string;
  tweetTime: string;
  tweetId: string;
  imageFileUrl: string;
  imageHeight: string;
  imageWidth: string;
  contentsText: string;
}

const TwitterCard: React.FC<Props> = ({ children, userName, userScreenName, profileImageUrl, tweetTime, tweetId, imageFileUrl, imageHeight, imageWidth, contentsText }) => {
  //------------------------
  // フック
  //------------------------
  // FireStore のコレクション名
  const [collectionName, setCollectionName] = useState('fav-tweets-database')

  // お気に入り追加状態（ローカルディスクに保存）
  const [savedFav, setSavedFav] = useLocalPersist("twitter-image-search-app:fav", tweetId, false)  
  //const [savedFav, setSavedFav] = useLocalPersist("twitter-image-search-app", "fav", JSON.stringify({tweetId:false}))  

  //------------------------
  // イベントハンドラ
  //------------------------
  // お気に入りボタンクリック時のイベントハンドラ
  const onClickFav = ((event: any)=> {
    console.log("savedFav : ", savedFav )

    if( auth.currentUser === null ) {
      return
    }

    // お気に入りに追加されていない場合
    if( savedFav === false ) {
      setSavedFav(true)

      // 新規に追加するドキュメントデータ
      const document = {
        userName: userName,     
        userScreenName: userScreenName,
        userUrl: "https://twitter.com/" + userName,
        userImageUrl: profileImageUrl,
        tweetId: tweetId, 
        tweetTime: tweetTime,   
        tweetUrl: "https://twitter.com/" + userName + "/status/" + tweetId,     
        tweetText: contentsText,
        tweetImageFileUrl: imageFileUrl,     
      }

      // firestore.collection(コレクション名).doc(ドキュメントID).set(ドキュメントデータ) で、コレクションに新たなドキュメントを追加する
      // ドキュメントID は、"twitter-image-search-app:fav"+tweetId
      // 新規にコレクションを追加する場合も、このメソッドで作成できる
      firestore.collection(collectionName).doc(auth.currentUser.email).collection(collectionName).doc("twitter-image-search-app:fav"+tweetId).set(document).then((ref: any) => {
        console.log("added tweet in fav-tweets-database")
        // ページ再読み込み（e.preventDefault() を追加したため）
        //window.location.reload()
      })
    }
    // 既にお気に入りに追加している場合
    else {
      setSavedFav(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(collectionName).doc(auth.currentUser.email).collection(collectionName).doc("twitter-image-search-app:fav"+tweetId).delete().then((ref: any)=> {
        console.log("deleted tweet in fav-tweets-database")
        // ページ再読み込み（e.preventDefault() を追加したため）
        //window.location.reload()
      })
    }
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  let userScreenNameAt: string = "@" + userScreenName
  let userUrl: string = "https://twitter.com/" + userScreenName
  let tweetUrl: string = "https://twitter.com/" + userScreenName + "/status/" + tweetId
  return (
    <Card variant="outlined">
      <CardHeader 
        title={
          <CardActionArea href={userUrl} target="_blank" >
            <Typography variant="subtitle1">{userName}</Typography>
          </CardActionArea>
        }
        avatar={
          <CardActionArea href={userUrl} target="_blank" >
            <Avatar aria-label="avatar" src={profileImageUrl} />
          </CardActionArea>
        }
        subheader={<Typography variant="subtitle2">{userScreenNameAt}</Typography>}
        action={
          <IconButton aria-label="settings" onClick={onClickFav} >
            { (savedFav ===  false) ? <StarBorderOutlinedIcon /> : <StarIcon /> }
          </IconButton>
          }
      />
      <CardActionArea href={imageFileUrl} target="_blank" >
        <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={imageFileUrl} />
      </CardActionArea>
      <CardContent>
      <Typography variant="body2" component="p">{tweetTime}</Typography>
        <Typography variant="body2" component="p">{contentsText}</Typography>
      </CardContent>
      <CardActions>
        <CardActionArea href={tweetUrl} target="_blank" >
          <Button size="small">...</Button>        
        </CardActionArea>
      </CardActions>
    </Card>
  )
}

export default TwitterCard;
