/* eslint-disable */
import React from 'react';
import { useState, useEffect, useRef } from 'react'

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

import AppRoutes, { ImageSearchPageConfig } from '../Config'
import AppTheme from '../components/Theme';
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TweetCard from '../components/TweetCard'

import { searchImageTweetsRecursive } from '../twitter_api/TwitterAPI';

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// 画像検索ページを表示するコンポーネント
const ImageSearchPage: React.VFC = () => {  
  //------------------------
  // フック
  //------------------------
  // ログインユーザー
  const [authCurrentUser, setAuthCurrentUser] = useState(auth.currentUser)

  // ダークモード
  const [darkMode, setDarkMode] = useLocalPersist("twitter-image-search-app", "darkMode", false)

  // 検索フォームの入力テキスト
  const [searchWord, setSearchWord] = useLocalPersist("twitter-image-search-app", "searchWord", "")

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const nTweetsImageRef = React.useRef<number>(0);  
  const maxIdRef = React.useRef<string>("");
  const seachResultsJsxRef = React.useRef<any>([]);  
  const [seachResultsJsx, setSeachResultsJsx] = useState([] as any);
  const [seachHistorys, setSeachHistorys] = useState([] as any);

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
    if( authCurrentUser !== null && searchWord != "" ) {
      firestore.collection(ImageSearchPageConfig.collectionNameSearchWord).doc(authCurrentUser.email).collection(ImageSearchPageConfig.collectionNameSearchWord).get().then( (snapshot)=> {
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
  }, [searchWord])

  //------------------------
  // イベントハンドラ
  //------------------------  
  // 入力フォーム更新時のイベントハンドラ
  const onChangeSearchWordTextField = (event: any) => {
    setSearchWord(event.currentTarget.value)
  }

  const onChangeSearchWordAutocomplete = (event: any, values: any) => {
    setSearchWord(values)
  }

  const onSubmitSearchWord = (event: React.FormEvent<HTMLFormElement>)=> {
    // submit イベント e の発生元であるフォームが持つデフォルトのイベント処理をキャンセル
    event.preventDefault(); 

    // ツイート検索入力に対しての処理
    if( searchWord != "" ) {
      // 検索履歴のデータベースに追加
      if( authCurrentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWord, 
          time: new Date(),   
        }
        firestore.collection(ImageSearchPageConfig.collectionNameSearchWord).doc(authCurrentUser.email).collection(ImageSearchPageConfig.collectionNameSearchWord).doc(searchWord).set(document).then((ref: any) => {
          console.log("added search word in ", ImageSearchPageConfig.collectionNameSearchWord)
        })
      }

      // Twitter API を用いて画像ツイートを取得する
      maxIdRef.current = ""
      searchImageTweetsRecursive(searchWord, ImageSearchPageConfig.searchCount, ImageSearchPageConfig.searchIter, maxIdRef.current)
        .then(([tweets, maxId]) => {
          maxIdRef.current = maxId
          nTweetsImageRef.current = 0
          seachResultsJsxRef.current = []
          tweets["statuses"].forEach((statuse: any)=> {
            const userId = statuse["user"]["id_str"]
            const userName = statuse["user"]["name"]
            const userScreenName = statuse["user"]["screen_name"]
            const profileImageUrl = statuse["user"]["profile_image_url"]
            const tweetTime = statuse["created_at"].replace("+0000","")
            const tweetText = statuse["text"]
            const tweetId = statuse["id_str"]

            let imageUrl = ""
            if (statuse["entities"]["media"] && statuse["entities"]["media"].indexOf(0)) {
              if(statuse["entities"]["media"][0]["media_url"]) {
                imageUrl = statuse["entities"]["media"][0]["media_url"]
              }
              else if(statuse["entities"]["media"][0]["media_url_https"]) {
                imageUrl = statuse["entities"]["media"][0]["media_url_https"]
              }
            }
            else if (statuse["extended_entities"] && statuse["extended_entities"]["media"] && statuse["extended_entities"]["media"].indexOf(0)) {
              if(statuse["extended_entities"]["media"][0]["media_url"]) {
                imageUrl = statuse["extended_entities"]["media"][0]["media_url"]
              }
              else if(statuse["extended_entities"]["media"][0]["media_url_https"]) {
                imageUrl = statuse["extended_entities"]["media"][0]["media_url_https"]
              }
            }
            else {
              return
            }

            const seachResultJsx_ = (
              <Grid item xs={2}>
                <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={ImageSearchPageConfig.imageHeight} imageWidth={ImageSearchPageConfig.imageWidth} contentsText={tweetText} />
              </Grid>              
            )
            //setSeachResultsJsx([...seachResultsJsxRef.current, seachResultJsx_])
            seachResultsJsxRef.current.push(seachResultJsx_)
            nTweetsImageRef.current += 1    
          })

          setSeachResultsJsx(seachResultsJsxRef.current)
          setSearchMessage("画像つきツイート数 : " + nTweetsImageRef.current)
        })
        .catch((reason) => {
          console.log("ツイートの取得に失敗しました", reason)
          setSearchMessage("ツイートの取得に失敗しました : " + reason )
        });
    }
    else {
      setSeachResultsJsx([])   
      setSearchMessage("検索ワードを入力してください" )   
    }

    // 入力フォームのテキストをクリア
    //setSearchWord("")
  }

  const onHandleLoadMoreTweet = (page: any) => {
    console.log( "[onHandleLoadMoreTweet] page : ", page )
    if(page === 0 ){ return }

    // Twitter API を用いて画像ツイートを取得する
    searchImageTweetsRecursive(searchWord, ImageSearchPageConfig.searchCountScroll, 1, maxIdRef.current)
      .then(([tweets, maxId]) => {
        maxIdRef.current = maxId
        tweets["statuses"].forEach((statuse: any)=> {
          const userId = statuse["user"]["id_str"]
          const userName = statuse["user"]["name"]
          const userScreenName = statuse["user"]["screen_name"]
          const profileImageUrl = statuse["user"]["profile_image_url"]
          const tweetTime = statuse["created_at"].replace("+0000","")
          const tweetText = statuse["text"]
          const tweetId = statuse["id_str"]

          let imageUrl = ""
          if (statuse["entities"]["media"] && statuse["entities"]["media"].indexOf(0)) {
            if(statuse["entities"]["media"][0]["media_url"]) {
              imageUrl = statuse["entities"]["media"][0]["media_url"]
            }
            else if(statuse["entities"]["media"][0]["media_url_https"]) {
              imageUrl = statuse["entities"]["media"][0]["media_url_https"]
            }
          }
          else if (statuse["extended_entities"] && statuse["extended_entities"]["media"] && statuse["extended_entities"]["media"].indexOf(0)) {
            if(statuse["extended_entities"]["media"][0]["media_url"]) {
              imageUrl = statuse["extended_entities"]["media"][0]["media_url"]
            }
            else if(statuse["extended_entities"]["media"][0]["media_url_https"]) {
              imageUrl = statuse["extended_entities"]["media"][0]["media_url_https"]
            }
          }
          else {
            return
          }

          const seachResultJsx_ = (
            <Grid item xs={2}>
              <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight={ImageSearchPageConfig.imageHeight} imageWidth={ImageSearchPageConfig.imageWidth} contentsText={tweetText} />
            </Grid>              
          )
          //setSeachResultsJsx([...seachResultsJsx, seachResultJsx_])
          seachResultsJsxRef.current.push(seachResultJsx_)
          nTweetsImageRef.current += 1
        })
        setSeachResultsJsx(seachResultsJsxRef.current)
        setSearchMessage("画像つきツイート数 : " + nTweetsImageRef.current)
      })
      .catch((reason: any) => {
      console.log("ツイートの取得に失敗しました", reason)
      setSearchMessage("ツイートの取得に失敗しました : " + reason )
      });
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "searchWord : ", searchWord )
  console.log("seachResultsJsx : ", seachResultsJsx)
  //console.log( "seachHistorys : ", seachHistorys )
  return (
    <ThemeProvider theme={darkMode ? AppTheme.darkTheme : AppTheme.lightTheme}>
      {/* デフォルトのCSSを適用（ダークモード時に背景が黒くなる）  */}
      <CssBaseline />
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.imageSearchPage.index} photoURL={authCurrentUser !== null ? authCurrentUser.photoURL : ''} darkMode={darkMode} setDarkMode={setDarkMode}/>
      {/* 検索ワード入力 */}
      <Box m={2}>
        <form onSubmit={onSubmitSearchWord}>
          <Grid container spacing={1}>
            {/* ツイート検索ワード入力 */}
            <Grid item xs={2}>
              <Autocomplete 
                freeSolo
                disableClearable
                onChange={onChangeSearchWordAutocomplete}
                id="ツイート検索"
                options={seachHistorys.map((option: any) => option.name)}
                renderInput={ (params: any) => (
                  <TextField 
                    {...params}
                    onChange={onChangeSearchWordTextField} 
                    value={searchWord} 
                    label="ツイート検索"
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
        loadMore={onHandleLoadMoreTweet}                              // 項目を読み込む際に処理するコールバック関数
        hasMore={true}                                                // 読み込みを行うかどうかの判定
        loader={<Box className="loader" key={0}>{""}</Box>}           // ロード中の表示
        initialLoad={false}
      >
        <Box m={1}>
          <Grid container spacing={2}>
            {seachResultsJsx}
          </Grid>
        </Box>
      </InfiniteScroll>
    </ThemeProvider>
    );
}

export default ImageSearchPage;