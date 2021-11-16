import React from 'react';
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';    // 文字表示を表現できるコンポーネント。文字位置や文字色、どのタグ（h1など）とするか、どのタグのスタイルをあてるかなどを設定できる。
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { CardMedia } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';
import Avatar from '@material-ui/core/Avatar'

//-----------------------------------------------
// ツイートをカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
type Props = {
  userName: string;
  profileImageUrl: string;
  tweetTime: string;
  tweetId: string;
  imageFileName: string;
  imageHeight: string;
  imageWidth: string;
  contentsText: string;
}

const TwitterCard: React.FC<Props> = ({ children, userName, profileImageUrl, tweetTime, tweetId, imageFileName, imageHeight, imageWidth, contentsText }) => {
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
          <IconButton aria-label="settings">
              <StarBorderOutlinedIcon />
          </IconButton>
          }
      />
      <CardActionArea href={imageFileName} target="_blank" >
        <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={imageFileName} />
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
