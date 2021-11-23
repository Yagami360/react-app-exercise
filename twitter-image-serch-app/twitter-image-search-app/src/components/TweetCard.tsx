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
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';

import useLocalPersist from './LocalPersist';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//-----------------------------------------------
// ツイートをカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// コンポーネントの引数
type Props = {
  userId: string;
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

const TweetCard: React.FC<Props> = ({ children, userId, userName, userScreenName, profileImageUrl, tweetTime, tweetId, imageFileUrl, imageHeight, imageWidth, contentsText }) => {
  //------------------------
  // フック
  //------------------------
  // フォロー
  const collectionNameFollow = 'follow-database'
  const [savedFollow, setSavedFollow] = useLocalPersist("twitter-image-search-app:follow", userScreenName, false)  

  // お気に入り
  const collectionNameFav = 'fav-tweets-database'
  const [savedFav, setSavedFav] = useLocalPersist("twitter-image-search-app:fav", tweetId, false)  

  //------------------------
  // イベントハンドラ
  //------------------------
  // フォローボタンクリック時のイベントハンドラ
  const onClickFollow = ((event: any)=> {
    console.log("savedFollow : ", savedFollow )

    if( auth.currentUser === null ) {
      return
    }

    // お気に入りに追加されていない場合
    if( savedFollow === false ) {
      setSavedFollow(true)

      // 新規に追加するドキュメントデータ
      const document = {
        userId: userId,
        userName: userName,     
        userScreenName: userScreenName,
        userUrl: "https://twitter.com/" + userName,
        userImageUrl: profileImageUrl,
      }

      // firestore.collection(コレクション名).doc(ドキュメントID).set(ドキュメントデータ) で、コレクションに新たなドキュメントを追加する
      firestore.collection(collectionNameFollow).doc(auth.currentUser.email).collection(collectionNameFollow).doc("twitter-image-search-app:follow:"+userScreenName).set(document).then((ref: any) => {
        console.log("added tweet in ", collectionNameFollow)
      })
    }
    // 既にお気に入りに追加している場合
    else {
      setSavedFollow(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(collectionNameFollow).doc(auth.currentUser.email).collection(collectionNameFollow).doc("twitter-image-search-app:follow:"+userScreenName).delete().then((ref: any)=> {
        console.log("deleted tweet in ", collectionNameFollow)
      })
    }
  })

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
        userId: userId,
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
      firestore.collection(collectionNameFav).doc(auth.currentUser.email).collection(collectionNameFav).doc("twitter-image-search-app:fav"+tweetId).set(document).then((ref: any) => {
        console.log("added tweet in ", collectionNameFav)
      })
    }
    // 既にお気に入りに追加している場合
    else {
      setSavedFav(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(collectionNameFav).doc(auth.currentUser.email).collection(collectionNameFav).doc("twitter-image-search-app:fav"+tweetId).delete().then((ref: any)=> {
        console.log("deleted tweet in ", collectionNameFav)
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
          <IconButton aria-label="settings" onClick={onClickFollow} >
            { (savedFollow ===  false) ? <PersonAddOutlinedIcon /> : <PersonAddIcon /> }
          </IconButton>
        }
      />
      <CardActionArea href={imageFileUrl} target="_blank" >
        <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={imageFileUrl} />
      </CardActionArea>
      <CardContent>
      <Typography variant="subtitle2" component="p">{tweetTime}</Typography>
        <Typography variant="body1" component="p">{contentsText}</Typography>
      </CardContent>
      <CardActions>
        <CardActionArea href={tweetUrl} target="_blank" >
          <Button size="small">...</Button>        
        </CardActionArea>
        <IconButton aria-label="settings" onClick={onClickFollow} >
            { (savedFollow ===  false) ? <PersonAddOutlinedIcon /> : <PersonAddIcon /> }
          </IconButton>
        <IconButton aria-label="settings" onClick={onClickFav} >
          { (savedFav ===  false) ? <StarBorderOutlinedIcon /> : <StarIcon /> }
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default TweetCard;
