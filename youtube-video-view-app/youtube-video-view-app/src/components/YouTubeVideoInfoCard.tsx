/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'

import firebase from "firebase";
import '../firebase/initFirebase'

import Box from '@material-ui/core/Box';
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
import PlayCircleOutlineRoundedIcon from '@material-ui/icons/PlayCircleOutlineRounded';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownAltOutlinedIcon from '@material-ui/icons/ThumbDownAltOutlined';
import ThumbDownAltRoundedIcon from '@material-ui/icons/ThumbDownAltRounded';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';

import AppConfig from '../Config'
import useLocalPersist from './LocalPersist';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//-----------------------------------------------
// 動画情報をカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// コンポーネントの引数
type Props = {
  channelId: string;
  channelTitle: string;
  profileImageUrl: string;
  subscriberCount: string;

  videoId: string;
  publishTime: string;
  title: string;
  description: string;
  categoryTitle: string;
  thumbnailsUrl: string;
  imageHeight: string;
  imageWidth: string;

  viewCount: string,
  likeCount: string,  
  dislikeCount: string,  
  favoriteCount: string,  

  tags: [];
}

const YouTubeVideoInfoCard: React.FC<Props> = ({ 
  children, 
  channelId, channelTitle, profileImageUrl, subscriberCount, 
  videoId, publishTime, title, description, categoryTitle,
  thumbnailsUrl, imageHeight, imageWidth, 
  viewCount, likeCount, dislikeCount, favoriteCount,
  tags,
}) => {
  //------------------------
  // フック
  //------------------------
  // フォロー
  const collectionNameFollow = 'follow-database'
  const [savedFollow, setSavedFollow] = useLocalPersist( AppConfig.appName + ":follow", channelId, false)  

  // お気に入り
  const collectionNameFav = 'fav-video-database'
  const [savedFav, setSavedFav] = useLocalPersist( AppConfig.appName + ":fav", videoId, false)  

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
        channelId: channelId,
        channelTitle: channelTitle,     
        profileImageUrl: profileImageUrl,
      }

      // firestore.collection(コレクション名).doc(ドキュメントID).set(ドキュメントデータ) で、コレクションに新たなドキュメントを追加する
      firestore.collection(collectionNameFollow).doc(auth.currentUser.email).collection(collectionNameFollow).doc(AppConfig.appName+":follow:"+channelId).set(document).then((ref: any) => {
        console.log("added tweet in ", collectionNameFollow)
      })
    }
    // 既にお気に入りに追加している場合
    else {
      setSavedFollow(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(collectionNameFollow).doc(auth.currentUser.email).collection(collectionNameFollow).doc(AppConfig.appName+":follow:"+channelId).delete().then((ref: any)=> {
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
        channelId: channelId,
        channelTitle: channelTitle,     
        profileImageUrl: profileImageUrl,
        videoId: videoId,
        publishTime: publishTime,
        title: title,
        description: description,
        categoryTitle: categoryTitle,
        thumbnailsUrl: thumbnailsUrl,     
      }

      // firestore.collection(コレクション名).doc(ドキュメントID).set(ドキュメントデータ) で、コレクションに新たなドキュメントを追加する
      // ドキュメントID は、"twitter-image-search-app:fav"+tweetId
      // 新規にコレクションを追加する場合も、このメソッドで作成できる
      firestore.collection(collectionNameFav).doc(auth.currentUser.email).collection(collectionNameFav).doc(AppConfig.appName+":fav"+videoId).set(document).then((ref: any) => {
        console.log("added video info in ", collectionNameFav)
      })
    }
    // 既にお気に入りに追加している場合
    else {
      setSavedFav(false)
      // firestore.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      firestore.collection(collectionNameFav).doc(auth.currentUser.email).collection(collectionNameFav).doc(AppConfig.appName+":fav"+videoId).delete().then((ref: any)=> {
        console.log("deleted video info in ", collectionNameFav)
      })
    }
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  const channelURL = "https://www.youtube.com/channel/" + channelId
  const youtubeVideoURL = "https://www.youtube.com/watch?v=" + videoId
  //const watchVideoURL = "/video_watch/" + videoId
  const watchVideoURL = AppConfig.videoWatchPage.path.split(":")[0] + videoId
  return (
    <Card variant="outlined">
      <CardHeader 
        title={
          <CardActionArea href={channelURL} target="_blank" >
            <Typography variant="subtitle1">{channelTitle}</Typography>
          </CardActionArea>
        }
        avatar={
          <CardActionArea href={channelURL} target="_blank" >
            <Avatar aria-label="avatar" src={profileImageUrl} />
          </CardActionArea>
        }
        subheader={<Typography variant="subtitle2">{"登録者数 : "+subscriberCount}</Typography>}
        action={
          <IconButton aria-label="settings" onClick={onClickFollow} >
            { (savedFollow ===  false) ? <PersonAddOutlinedIcon /> : <PersonAddIcon /> }
          </IconButton>
        }
      />
      <CardActionArea href={watchVideoURL} target="_blank" >
        <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={thumbnailsUrl} />
      </CardActionArea>
      <CardContent>
        <Box style={{display:"flex"}}>
          { /* 日付 */ }        
          <Typography variant="subtitle2" component="p">{publishTime}</Typography>
          { /* 動画カテゴリ */ }
          <Box mx={2}>
            <Typography variant="subtitle2">{"動画カテゴリ : " + categoryTitle}</Typography>
          </Box>
        </Box>
        { /* 動画タイトル */ }        
        <Typography variant="subtitle1" component="p">{title}</Typography>
        { /* 詳細 */ }
        <Typography variant="subtitle2">{description.substring(0,100)+" ..."}</Typography>
        <CardActionArea href={watchVideoURL} target="_blank">
          <Button size="small">...</Button>        
        </CardActionArea>
      </CardContent>
      <CardActions>
        { /* 再生回数 */ }
        <PlayCircleOutlineRoundedIcon />
        <Typography variant="subtitle2">{viewCount}</Typography>
        { /* 高評価 */ }
        <ThumbUpOutlinedIcon />
        <Typography variant="subtitle2">{likeCount}</Typography>
        { /* 低評価 */ }
        <ThumbDownAltOutlinedIcon />
        <Typography variant="subtitle2">{dislikeCount}</Typography>
        { /* お気に入り数 */ }
        <FavoriteBorderOutlinedIcon />
        <Typography variant="subtitle2">{favoriteCount}</Typography>
        { /* フォロー */ }
        <IconButton aria-label="settings" onClick={onClickFollow} >
          { (savedFollow ===  false) ? <PersonAddOutlinedIcon /> : <PersonAddIcon /> }
        </IconButton>
        { /* お気に入り */ }
        <IconButton aria-label="settings" onClick={onClickFav} >
          { (savedFav ===  false) ? <StarBorderOutlinedIcon /> : <StarIcon /> }
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default YouTubeVideoInfoCard;
