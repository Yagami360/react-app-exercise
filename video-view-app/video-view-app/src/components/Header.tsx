import React from 'react';
import { Link } from "react-router-dom";

import firebase from "firebase";
import '../firebase/initFirebase'

import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
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
import {Tabs, Tab } from "@material-ui/core";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from "@material-ui/core/Switch";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import AppConfig from '../Config'
import useLocalPersist from './LocalPersist';

// Auth オブジェクトの作成
const auth: any = firebase.auth()
//auth.signOut()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

//-----------------------------------------------
// ヘッダーのレイアウトを設定して表示するコンポーネント
// [引数]
//   text : ヘッダーの文字列
//-----------------------------------------------
// コンポーネントの引数
type Props = {
  title: string;            // ヘッダーのタイトル文字列
  selectedTabIdx: number;   // ヘッダーのタブ番号
  photoURL: string;         // ログインアイコンの画像URL
  darkMode: any;            // ダークモードのステート
  setDarkMode: any;         // ダークモードのステートを更新するメソッド
}

// JavaSpcript でのコンポーネントの引数 props は、React.FC<Props> のようにして TypeScripts における Generic で定義出来る。（Generics は抽象的な型引数を使用して、実際に実行されるまで型が確定しないクラス・関数・インターフェイスを実現する為に使用される）
// children 引数は React.FC でコンポーネント定義すると暗黙的に使えるようになる
const Header: React.FC<Props> = ({ children, title, selectedTabIdx, photoURL, darkMode, setDarkMode }) => {
  //------------------------
  // フック
  //------------------------
  // メニューボタンの開閉状態
  const [isOpenMenuDrawer, setIsOpenMenuDrawer] = React.useState(false)

  // タブの選択状態
  const [selectedTab, setSelectedTab] = React.useState(selectedTabIdx)

  // ダークモード
  //const [darkMode, setDarkMode] = useLocalPersist("twitter-image-search-app", "darkMode", false)

  // ログインボタンの開閉状態
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isOpenLoginMenu = Boolean(anchorEl);

  //------------------------
  // イベントハンドラ
  //------------------------
  // メニュー画面
  const onClickMenuDrawer = ((event: React.MouseEvent<HTMLInputElement>)=> {
    // メニュー画面を開く
    setIsOpenMenuDrawer(true)
  })

  const onCloseMenuDrawer = ((event: React.MouseEvent<HTMLInputElement>)=> {
    // メニュー画面を閉じる
    setIsOpenMenuDrawer(false)
  })

  // タブ
  const onChangeSelectedTab = (event: any, value: any) => {
    setSelectedTab(value);
  };

  // ダークモード切り替えボタン
  const onChangeDarkMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  // ログインアイコン
  const onClickLoginMenu = ((event: React.MouseEvent<HTMLButtonElement>)=> {
    setAnchorEl(event.currentTarget)
  })

  const onCloseLoginMenu = (()=> {
    setAnchorEl(null)
  })

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

  //------------------------
  // JSX での表示処理
  //------------------------
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <Box onClick={onClickMenuDrawer}>
            <MenuIcon />
          </Box>
        </IconButton>
        {/* メニュー画面 */ }
        <Drawer anchor="left" open={isOpenMenuDrawer} onClose={onCloseMenuDrawer}>
          {/* メニューの各項目をリストで定義 */}
          <List component="nav">
            { /* textDecoration: 'none' : 下線を消す */ }
            <Link to={AppConfig.topPage.path} style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <ListItemText primary="ホーム" />
              </ListItem>
            </Link>
            <Link to={AppConfig.testPage.path} style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <ListItemText primary="テスト" />
              </ListItem>
            </Link>
          </List>
        </Drawer>
        { /* タイトル文字列 */}
        <Box sx={{ml: 2, mr: 4}}>
          <Link to="/" style={{ textDecoration: 'none', color: 'white'}}>
            <Typography variant="h6">{title}</Typography>
          </Link>
        </Box>
        { /* タブ */}
        <Box>
          <Tabs value={selectedTab} onChange={onChangeSelectedTab} TabIndicatorProps={{style: {background:'#FFFFFF'}}}>
            <Tab label="ホーム" component={Link} to={AppConfig.topPage.path} />
            <Tab label="テスト" component={Link} to={AppConfig.testPage.path} />
          </Tabs>
        </Box>
        { /* ダークモード切り替えボタン */ }
        <Box style={{ flexGrow: 1 }}></Box>   {/* <div style={{ flexGrow: 1 }}></div> : 右寄せ */}
        <Box mr={2}>
          <FormGroup>
            <FormControlLabel 
              control={
                <Switch checked={darkMode} onChange={onChangeDarkMode} color="default" style={{ color: "#000099"}} inputProps={{ 'aria-label': 'controlled' }}/>
              } 
              label="ダークモード"
            />
          </FormGroup>
        </Box>
        { /* ログインアイコン */}
        <Button id="login-button" aria-controls="basic-menu" aria-haspopup="true" aria-expanded={isOpenLoginMenu ? 'true' : undefined} onClick={onClickLoginMenu}>
          <Avatar aria-label="avatar" src={photoURL} />
        </Button>
        <Menu id="login-menu" anchorEl={anchorEl} open={isOpenLoginMenu} onClose={onCloseLoginMenu} MenuListProps={{'aria-labelledby': 'basic-button',}}>
          <MenuItem onClick={onCloseLoginMenu}>
            <Box onClick={onClickLogIn}>ログイン</Box>
          </MenuItem>
          <MenuItem onClick={onCloseLoginMenu}>
          <Box onClick={onClickLogOut}>ログアウト</Box>
          </MenuItem>
        </Menu>
      </Toolbar>        
    </AppBar>
  )
}

export default Header;


/*
        <Box onClick={onClickLogIn}>
          <Avatar aria-label="avatar" src={photoURL} />
        </Box>
*/