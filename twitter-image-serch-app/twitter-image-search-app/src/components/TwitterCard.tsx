import React from 'react';
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';    // 文字表示を表現できるコンポーネント。文字位置や文字色、どのタグ（h1など）とするか、どのタグのスタイルをあてるかなどを設定できる。
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { CardMedia } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import StarBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined';

//-----------------------------------------------
// ツイートをカード形式で表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
type Props = {
  title: string;
  subheader: string;
  imageFileName: string;
  imageHeight: string;
  imageWidth: string;
  contentsText: string;
}

const TwitterCard: React.FC<Props> = ({ children, title, subheader, imageFileName, imageHeight, imageWidth, contentsText }) => {
  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <Card variant="outlined">
      <CardHeader 
        title={title} 
        subheader={subheader}
        action={
          <IconButton aria-label="settings">
              <StarBorderOutlinedIcon />
          </IconButton>
          }
      />
      <CardMedia style={{ height: imageHeight, maxWidth : imageWidth }} image={imageFileName} />
      <CardContent>
        <Typography variant="body2" component="p">{contentsText}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small">...</Button>        
      </CardActions>
    </Card>
  )
}

export default TwitterCard;
