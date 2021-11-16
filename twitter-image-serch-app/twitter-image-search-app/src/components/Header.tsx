import React from 'react';
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';    // 文字表示を表現できるコンポーネント。文字位置や文字色、どのタグ（h1など）とするか、どのタグのスタイルをあてるかなどを設定できる。
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';            // ナビゲーションバー
import Toolbar from '@material-ui/core/Toolbar';          // ナビゲーションバー
import MenuIcon from '@material-ui/icons/Menu';           // メニューコンポーネント群。Buttonと組み合わせて、クリックされたときにメニューを開くといったように使う。
import Drawer from '@material-ui/core/Drawer';
import Avatar from '@material-ui/core/Avatar'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

//-----------------------------------------------
// ヘッダーのレイアウトを設定して表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
type Props = {
  text: string;
}

// JavaSpcript でのコンポーネントの引数 props は、React.FC<Props> のようにして TypeScripts における Generic で定義出来る。（Generics は抽象的な型引数を使用して、実際に実行されるまで型が確定しないクラス・関数・インターフェイスを実現する為に使用される）
// children 引数は React.FC でコンポーネント定義すると暗黙的に使えるようになる
const Header: React.FC<Props> = ({ children, text }) => {
  // メニューボタンの状態
  const [isOpenDrawer, setDrawerState] = React.useState(false)

  //------------------------
  // JSX での表示処理
  //------------------------
  // <div style={{ flexGrow: 1 }}></div> : 右寄せ
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Drawer open={isOpenDrawer} onClose={() => {setDrawerState(false)}}>
          <div tabIndex={0} role="button" onClick={() => {setDrawerState(false)}} onKeyDown={() => {setDrawerState(false)}}>
            <Link to="/">
              <ListItem button>
                <ListItemText primary="Home" />
              </ListItem>
            </Link>
          </div>
        </Drawer>
        <Typography variant="h6">{text}</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <Avatar aria-label="avatar" src="" />
      </Toolbar>        
    </AppBar>
  )
}

export default Header;
