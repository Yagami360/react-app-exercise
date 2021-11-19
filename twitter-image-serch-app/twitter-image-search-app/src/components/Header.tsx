import React from 'react';
import { Link } from "react-router-dom";

import firebase from "firebase";
import '../firebase/initFirebase'

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
import ListItemText from '@material-ui/core/ListItemText';

//-----------------------------------------------
// ヘッダーのレイアウトを設定して表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// Auth オブジェクトの作成
const auth: any = firebase.auth()
//auth.signOut()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// コンポーネントの引数
type Props = {
  title: string;
}

// JavaSpcript でのコンポーネントの引数 props は、React.FC<Props> のようにして TypeScripts における Generic で定義出来る。（Generics は抽象的な型引数を使用して、実際に実行されるまで型が確定しないクラス・関数・インターフェイスを実現する為に使用される）
// children 引数は React.FC でコンポーネント定義すると暗黙的に使えるようになる
const Header: React.FC<Props> = ({ children, title }) => {
  //------------------------
  // フック
  //------------------------
  // メニューボタンの開閉状態
  const [isOpenDrawer, setIsOpenDrawer] = React.useState(false)

  //------------------------
  // イベントハンドラ
  //------------------------
  const onClickLogIn = ((event: React.MouseEvent<HTMLInputElement>) => {
    // auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL) : ログイン状態を保持
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      // 認証プロバイダー（Google）の作成
      const provider: any = new firebase.auth.GoogleAuthProvider();

      // auth.signInWithPopup(認証プロバイダー) : 
      // ポップアップ画面で認証を行う。このメソッドは Promise オブジェクトを返すので、then(...) で認証後の処理を定義する。
      // この時、result.user には以下の情報が入る
      // result.user.providerID : 利用している認証プロバイダーのID
      // result.user.uid : ユーザーID
      // result.user.displayName : ユーザーの表示名
      // result.user.email : ユーザーのEmail
      // result.user.phoneNumber : ユーザーの電話番号
      auth.signInWithPopup(provider).then((result: any) => {
        console.log("succeed login for ", result.user.displayName )
      }).catch((error: any) => {
        // ログイン失敗時の処理
        console.log("faild login")
      })
    })
  })

  const onClickLogOut = ((event: React.MouseEvent<HTMLInputElement>)=> {
    // ログアウトする
    auth.signOut()
    console.log("logouted")
  })

  const onClickDrawer = ((event: React.MouseEvent<HTMLInputElement>)=> {
    // メニュー画面を開く
    setIsOpenDrawer(true)
  })

  const onCloseDrawer = ((event: React.MouseEvent<HTMLInputElement>)=> {
    // メニュー画面を閉じる
    setIsOpenDrawer(false)
  })

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <div onClick={onClickDrawer}>
            <MenuIcon />
          </div>
        </IconButton>
        {/* メニュー画面 */ }
        <Drawer anchor="left" open={isOpenDrawer} onClose={onCloseDrawer}>
          {/* メニューの各項目をリストで定義 */}
          <List component="nav">
            { /* textDecoration: 'none' : 下線を消す */ }
            <Link to="/" style={{ textDecoration: 'none', color: 'black'}}>
              <ListItem button>
                <ListItemText primary="Home" />
              </ListItem>
            </Link>
            <Link to="/follow" style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <ListItemText primary="タイムライン" />
              </ListItem>
            </Link>
            <Link to="/fav" style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <ListItemText primary="お気に入り" />
              </ListItem>
            </Link>
          </List>
        </Drawer>
        <Link to="/" style={{ textDecoration: 'none', color: 'white'}}>
          <Typography variant="h6">{title}</Typography>
        </Link>
        {/* <div style={{ flexGrow: 1 }}></div> : 右寄せ */}
        <div style={{ flexGrow: 1 }}></div>
        <div onClick={onClickLogIn}>
          <Avatar aria-label="avatar" src={auth.currentUser !== null ? auth.currentUser.photoURL : ''} />
        </div>
      </Toolbar>        
    </AppBar>
  )
}

export default Header;
