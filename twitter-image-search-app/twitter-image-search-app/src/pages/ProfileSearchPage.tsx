/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react'

import firebase from "firebase";
import '../firebase/initFirebase'

import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from '@material-ui/lab/Autocomplete';

import InfiniteScroll from "react-infinite-scroller"

import AppRoutes, { ProfileSearchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TwitterProfileCard from '../components/TwitterProfileCard'

import { searchUsersRecursive } from '../twitter_api/TwitterAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// プロフィール検索ページを表示するコンポーネント
const ProfileSearchPage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist("twitter-image-search-app", "darkMode", false)

  // 検索フォームの入力テキスト
  const [searchWordProfile, setSearchWordProfile] = useLocalPersist("twitter-image-search-app", "searchWordProfile", "")

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const nProfilesRef = React.useRef<number>(0);  
  const pageRef = React.useRef<number>(1);
  const seachResultsUsersJsxRef = React.useRef<any>([]);  
  const [seachResultsUsersJsx, setSeachResultsUsersJsx] = useState([]);
  const [seachHistorys, setSeachHistorys] = useState([]);

  // ログイン確認の副作用フック  
  useEffect(() => {
    // Firebase Auth のログイン情報の初期化処理は、onAuthStateChanged 呼び出し時に行われる（このメソッドを呼び出さないと、ページ読み込み直後に firebase.auth().currentUser の値が null になることに注意）
    const unregisterAuthObserver = auth.onAuthStateChanged( (user: any) => {
      setAuthCurrentUser(user)
    })

    // アンマウント時の処理
    return () => {
      unregisterAuthObserver()
    }
  }, [])

  // 副作用フック
  useEffect(() => {
    // 検索履歴
    if( authCurrentUser !== null && searchWordProfile != "" ) {
      firestore.collection(ProfileSearchPageConfig.collectionNameSearchWord).doc(authCurrentUser.email).collection(ProfileSearchPageConfig.collectionNameSearchWord).get().then( (snapshot)=> {
        let id = 1
        let seachHistorys_: any = []
        snapshot.forEach((document)=> {
          // document.data() : ドキュメント内のフィールド
          const field = document.data()
          //console.log( "field : ", field )
          seachHistorys_.push({ id: id, name: field.searchWord })
          id += 1
        })         
        setSeachHistorys(seachHistorys_)
      })
    }
  }, [searchWordProfile])

  //------------------------
  // イベントハンドラ
  //------------------------  
  // 入力フォーム更新時のイベントハンドラ
  const onChangeSearchWordProfileTextField = (event: any) => {
    setSearchWordProfile(event.currentTarget.value)
  }

  const onChangeSearchWordProfileAutocomplete = (event: any, values: any) => {
    setSearchWordProfile(values)
  }

  const onSubmitSearchWord = (event: React.FormEvent<HTMLFormElement>)=> {
    // submit イベント e の発生元であるフォームが持つデフォルトのイベント処理をキャンセル
    event.preventDefault(); 

    // プロフィール検索入力に対しての処理
    if( searchWordProfile != "" ) {
      // 検索履歴のデータベースに追加
      if( authCurrentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWordProfile, 
          time: new Date(),   
        }
        firestore.collection(ProfileSearchPageConfig.collectionNameSearchWord).doc(authCurrentUser.email).collection(ProfileSearchPageConfig.collectionNameSearchWord).doc(searchWordProfile).set(document).then((ref: any) => {
          console.log("added search word in ", ProfileSearchPageConfig.collectionNameSearchWord)
        })
      }

      // Cloud Function 経由で TwitterAPI を叩いてツイート検索
      pageRef.current = 1
      searchUsersRecursive(searchWordProfile, ProfileSearchPageConfig.searchCount, ProfileSearchPageConfig.searchIter, pageRef.current)
        .then(([users, page]) => {        
          pageRef.current = page
          nProfilesRef.current = 0
          seachResultsUsersJsxRef.current = []
          users.forEach((user: any)=> {
            const userId = user["id_str"]
            const userName = user["name"]
            const userScreenName = user["screen_name"]
            const profileImageUrl = user["profile_image_url"]
            const location = user["location"]
            const followersCount = user["followers_count"]
            const followsCount = user["friends_count"]
            const profileBannerImageUrl = user["profile_banner_url"]
            const createdAt = user["created_at"].replace("+0000","")
            const description = user["description"]

            seachResultsUsersJsxRef.current.push(
              <Grid item xs={4}>
                <TwitterProfileCard 
                  userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} createdAt={createdAt} 
                  location={location} followersCount={followersCount} followsCount={followsCount}
                  profileBannerImageUrl={profileBannerImageUrl} imageHeight={ProfileSearchPageConfig.imageHeight} imageWidth={ProfileSearchPageConfig.imageWidth} 
                  description={description}
                />
              </Grid>
            )            
            nProfilesRef.current += 1
          })
          setSeachResultsUsersJsx(seachResultsUsersJsxRef.current)
          setSearchMessage("ユーザー数 : " + nProfilesRef.current)
        })
        .catch((reason) => {
          console.log("プロフィールの取得に失敗しました", reason)
          setSearchMessage("プロフィールの取得に失敗しました : " + reason )
        });      
    }
    else {
      setSeachResultsUsersJsx([])
      setSearchMessage("検索ワードを入力してください" ) 
    }

    //setSearchWord("")
  }

  const onHandleLoadMoreProfile = (page: any) => {
    console.log( "[onHandleLoadMoreProfile] page : ", page )
    if(page === 0 ){ return }

    // Twitter API を用いて画像ツイートを取得する
    searchUsersRecursive(searchWordProfile, ProfileSearchPageConfig.searchCountScroll, 1, pageRef.current)
    .then(([users, page]) => {        
      pageRef.current = page
      users.forEach((user: any)=> {
        const userId = user["id_str"]
        const userName = user["name"]
        const userScreenName = user["screen_name"]
        const profileImageUrl = user["profile_image_url"]
        const location = user["location"]
        const followersCount = user["followers_count"]
        const followsCount = user["friends_count"]
        const profileBannerImageUrl = user["profile_banner_url"]
        const createdAt = user["created_at"].replace("+0000","")
        const description = user["description"]

        seachResultsUsersJsxRef.current.push(
          <Grid item xs={4}>
            <TwitterProfileCard 
              userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} createdAt={createdAt} 
              location={location} followersCount={followersCount} followsCount={followsCount}
              profileBannerImageUrl={profileBannerImageUrl} imageHeight={ProfileSearchPageConfig.imageHeight} imageWidth={ProfileSearchPageConfig.imageWidth} 
              description={description}
            />
          </Grid>
        )            
        nProfilesRef.current += 1
      })
      setSeachResultsUsersJsx(seachResultsUsersJsxRef.current)
      setSearchMessage("ユーザー数 : " + nProfilesRef.current)
    })
    .catch((reason) => {
      console.log("プロフィールの取得に失敗しました", reason)
      setSearchMessage("プロフィールの取得に失敗しました : " + reason )
    });      
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "searchWordProfile : ", searchWordProfile )
  console.log( "seachResultsUsersJsxRef.current : ", seachResultsUsersJsxRef.current )
  console.log( "seachResultsUsersJsx : ", seachResultsUsersJsx )
  console.log( "pageRef.current : ", pageRef.current )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.profileSearchPage.index} photoURL={authCurrentUser !== null ? authCurrentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* 検索ワード入力 */}
      <Box m={2}>
        <form onSubmit={onSubmitSearchWord}>
          <Grid container spacing={1}>
            {/* プロフィール検索ワード入力 */}
            <Grid item xs={2}>
              <Autocomplete 
                freeSolo
                disableClearable
                onChange={onChangeSearchWordProfileAutocomplete}
                id="プロフィール検索"
                options={seachHistorys.map((option: any) => option.name)}
                renderInput={ (params: any) => (
                  <TextField 
                    {...params}
                    onChange={onChangeSearchWordProfileTextField} 
                    value={searchWordProfile} 
                    label="プロフィール検索"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                      startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                    }}
                  />            
                )}
              />
            </Grid>            
            { /* 検索ボタン　*/ }
            <Grid item xs={1}>
              <Button type="submit" variant="contained" style={{ borderRadius: 25 }}>
                <Typography variant="subtitle1">🔍 検索</Typography>
              </Button>
            </Grid>
          </Grid>
          <Typography variant="subtitle2">{searchMessage}</Typography>
        </form>
      </Box>
      {/* 検索ヒット画像 | react-infinite-scroller を使用した無限スクロールを行う */}
      <InfiniteScroll
        pageStart={0}
        loadMore={onHandleLoadMoreProfile}                            // 項目を読み込む際に処理するコールバック関数
        hasMore={true}                                                // 読み込みを行うかどうかの判定
        loader={<Box className="loader" key={0}>{""}</Box>}           // ロード中の表示
        initialLoad={false}
      >
        <Box m={1}>
          <Grid container spacing={2}>
            {seachResultsUsersJsx}
          </Grid>
        </Box>
      </InfiniteScroll>
    </ThemeProvider>
    );
}

export default ProfileSearchPage;
