/* eslint-disable */
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
import Avatar from '@material-ui/core/Avatar'
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import useLocalPersist from './LocalPersist';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//-----------------------------------------------
// ツイッターのプロフィールをカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// コンポーネントの引数
type Props = {
  userId: string;
  userName: string;
  userScreenName: string;
  profileImageUrl: string;
  createdAt: string;
  location: string;
  followersCount: number;
  followsCount: number;
  profileBannerImageUrl: string;
  imageHeight: number;
  imageWidth: number;
  description: string;
}

const TwitterProfileCard: React.FC<Props> = ({ children, userId, userName, userScreenName, profileImageUrl, createdAt, location, followersCount, followsCount, profileBannerImageUrl, imageHeight, imageWidth, description }) => {
  //------------------------
  // フック
  //------------------------
  // フォロー
  const collectionNameFollow = 'follow-database'
  const [savedFollow, setSavedFollow] = useLocalPersist("twitter-image-search-app:follow", userScreenName, false)  

  //------------------------
  // イベントハンドラ
  //------------------------
  // フォローボタンクリック時のイベントハンドラ
  const onClickFollow = ((event: any)=> {
    console.log("savedFollow : ", savedFollow )

    if( auth.currentUser === null ) {
      return
    }

    // 未フォローの場合
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
    // フォロー済みの場合
    else {
      setSavedFollow(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(collectionNameFollow).doc(auth.currentUser.email).collection(collectionNameFollow).doc("twitter-image-search-app:follow:"+userScreenName).delete().then((ref: any)=> {
        console.log("deleted tweet in ", collectionNameFollow)
      })
    }
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  let userScreenNameAt: string = "@" + userScreenName
  let userUrl: string = "https://twitter.com/" + userScreenName
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
      <CardActionArea href={profileBannerImageUrl} target="_blank" >
        <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={profileBannerImageUrl} />
      </CardActionArea>
      <CardContent>
        <List dense={true}>
          <ListItem>
            <Typography variant="subtitle2" component="p">アカウント作成日 : {createdAt}</Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle2" component="p">場所 : {location}</Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle2" component="p">フォロー数 : {followsCount}</Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <Typography variant="subtitle2" component="p">フォロワー数 : {followersCount}</Typography>
          </ListItem>
          <Divider />
        </List>
        <Typography variant="body1" component="p">{description}</Typography>
      </CardContent>
      <CardActions>
        <IconButton aria-label="settings" onClick={onClickFollow} >
            { (savedFollow ===  false) ? <PersonAddOutlinedIcon /> : <PersonAddIcon /> }
          </IconButton>
      </CardActions>
    </Card>
  )
}

export default TwitterProfileCard;
