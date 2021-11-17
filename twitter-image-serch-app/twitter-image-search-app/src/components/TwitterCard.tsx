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
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';
import Avatar from '@material-ui/core/Avatar'

//-----------------------------------------------
// ツイートをカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// Firestore にアクセスするためのオブジェクト作成
const db = firebase.firestore()

// コンポーネントの引数
type Props = {
  userName: string;
  profileImageUrl: string;
  tweetTime: string;
  tweetId: string;
  imageFileUrl: string;
  imageHeight: string;
  imageWidth: string;
  contentsText: string;
}

const TwitterCard: React.FC<Props> = ({ children, userName, profileImageUrl, tweetTime, tweetId, imageFileUrl, imageHeight, imageWidth, contentsText }) => {
  //------------------------
  // フック
  //------------------------
  // FireStore のコレクション名
  const [collectionName, setCollectionName] = useState('fav-tweets-database')
  const [documentId, setdocumentId] = useState('')

  // お気に入り追加状態
  const [isFav, setIsFav] = useState(false)  

  //------------------------
  // イベントハンドラ
  //------------------------
  // お気に入りボタンクリック時のイベントハンドラ
  const onClickFav = ((event: any)=> {
    // お気に入りに追加されていない場合
    if( isFav === false ) {
      setIsFav(true)

      // 新規に追加するドキュメントデータ
      const document = {
        userName: userName,     
        userNameAt: "@" + userName,
        userUrl: "https://twitter.com/" + userName,
        userImageUrl: profileImageUrl,
        tweetId: tweetId, 
        tweetTime: tweetTime,   
        tweetUrl: "https://twitter.com/" + userName + "/status/" + tweetId,     
        tweetText: contentsText,
        tweetImageFileUrl: imageFileUrl,     
      }
      console.log("document : ", document)

      // db.collection(コレクション名).add(ドキュメントデータ) で、コレクションに新たなドキュメントを追加する
      // この時ドキュメントIDは自動的に割り振られる
      // 新規にコレクションを追加する場合も、このメソッドで作成できる
      db.collection(collectionName).add(document).then((ref: any) => {
        console.log("added tweet in fav-tweets-database : documend id = ", ref.id)
        setdocumentId(ref.id)
      })
    }
    // 既にお気に入りに追加している場合
    else {
      setIsFav(false)
      // db.collection(コレクション名).doc(ドキュメントID).delete() で、ドキュメントを削除する
      db.collection(collectionName).doc(documentId).delete().then((ref: any)=> {
        console.log("deleted tweet in fav-tweets-database")
      })
    }
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  let userNameAt: string = "@" + userName
  let userUrl: string = "https://twitter.com/" + userName
  let tweetUrl: string = "https://twitter.com/" + userName + "/status/" + tweetId
  return (
    <Card variant="outlined">
      <CardHeader 
        title={
          <CardActionArea href={userUrl} target="_blank" >
            <Typography variant="subtitle1">{userNameAt}</Typography>
          </CardActionArea>
        }
        avatar={
          <CardActionArea href={userUrl} target="_blank" >
            <Avatar aria-label="avatar" src={profileImageUrl} />
          </CardActionArea>
        }
        subheader={<Typography variant="subtitle2">{tweetTime}</Typography>}
        action={
          <IconButton aria-label="settings" onClick={onClickFav} >
            { (isFav ===  false) ? <StarBorderOutlinedIcon /> : <StarBorderIcon /> }
          </IconButton>
          }
      />
      <CardActionArea href={imageFileUrl} target="_blank" >
        <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={imageFileUrl} />
      </CardActionArea>
      <CardContent>
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
