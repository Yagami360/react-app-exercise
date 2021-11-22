import React from 'react';
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Link } from "react-router-dom";

import firebase from "firebase";
import '../firebase/initFirebase'

import { useTheme, ThemeProvider} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { TextField } from '@material-ui/core'
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from '@material-ui/lab/Autocomplete';

import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TwitterCard from '../components/TwitterCard'

const cloudFunctionSearchTweetUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweet"
//const cloudFunctionSearchTweetUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweetRecursive"
const cloudFunctionSearchUserUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchUser"
const searchCount: number = 100

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()
const collectionNameSearchWord = "search-word-database"

// トップページを表示するコンポーネント
const HomePage: React.VFC = () => {
  // useTheme() でテーマ（画面全体のスタイル）のオブジェクトを作成
  const theme = useTheme();

  //------------------------
  // フック
  //------------------------
  // 検索フォームの入力テキスト
  const [searchWord, setSearchWord] = useLocalPersist("twitter-image-search-app", "searchWord", "")
  const [searchWordProfile, setSearchWordProfile] = useLocalPersist("twitter-image-search-app", "searchWordProfile", "")

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const [seachResultsJsx, setSeachResultsJsx] = useState([]);
  const [seachResultsUsers, setSeachResultsUsers] = useState([]);
  const [seachHistorys, setSeachHistorys] = useState([]);

  // 副作用フック。
  // ｛初期起動時・検索結果が更新される・お気に入り状態が更新される｝のタイミングで呼び出される
  useEffect(() => {
    // 検索履歴
    if( auth.currentUser !== null && searchWord != "" ) {
      firestore.collection(collectionNameSearchWord).doc(auth.currentUser.email).collection(collectionNameSearchWord).get().then( (snapshot)=> {
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
  }, [searchWord, searchWordProfile])

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
      if( auth.currentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWordProfile, 
          time: new Date(),   
        }
        firestore.collection(collectionNameSearchWord).doc(auth.currentUser.email).collection(collectionNameSearchWord).doc(searchWordProfile).set(document).then((ref: any) => {
          console.log("added search word in search-word-database")
        })
      }

      // Cloud Function 経由で TwitterAPI を叩いてツイート検索
      fetch(
        cloudFunctionSearchUserUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "search_word" : searchWord,
            "count": searchCount,
          })
        }
      )
        .then( (response) => {
          //console.log("response : ", response)
          if ( !response.ok) {
            throw new Error();
          }
          return response.json()
        })
        .then((data) => {        
          const users = data["users"]
          let seachResultsUsers_: any = []
          users.forEach((user: any)=> {
            //const userId = user["id_str"]
            //const userName = user["name"]
            //const userScreenName = user["screen_name"]
            //const description = user["description"]
            //console.log("userId : ", userId)            
            //console.log("userName : ", userName)
            //console.log("userScreenName : ", userScreenName)
            //console.log("description : ", description)
            seachResultsUsers_.push(user)
          })
          setSeachResultsUsers(seachResultsUsers_)
        })
        .catch((reason) => {
          console.log("プロフィールの取得に失敗しました", reason)
          setSearchMessage("プロフィールの取得に失敗しました : " + reason )
        });      
    }
    else {
      setSeachResultsUsers([])
    }

    // ツイート検索入力に対しての処理
    if( searchWord != "" ) {
      // 検索履歴のデータベースに追加
      if( auth.currentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWord, 
          time: new Date(),   
        }
        firestore.collection(collectionNameSearchWord).doc(auth.currentUser.email).collection(collectionNameSearchWord).doc(searchWord).set(document).then((ref: any) => {
          console.log("added search word in search-word-database")
        })
      }

      // Cloud Function 経由で TwitterAPI を叩いてツイート検索
      fetch(
        cloudFunctionSearchTweetUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "search_word" : searchWord + " filter:images",
            "count": searchCount,
          })
        }
      )
        .then( (response) => {
          //console.log("response : ", response)
          if ( !response.ok) {
            throw new Error();
          }
          return response.json()
        })
        .then((data) => {        
          const tweets = data["tweets"]
          const statuses = tweets["statuses"]
          let nTweetsImage = 0
          //console.log("tweets : ", tweets)
          //console.log("statuses : ", statuses)

          let seachResultsJsx_: any = []
          statuses.forEach((statuse: any)=> {
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

            console.log( "seachResultsUsers.length : ", seachResultsUsers.length )
            if( seachResultsUsers.length > 0 ) {
              // プロフィール検索結果とユーザー名が一致するツイートのみ表示
              seachResultsUsers.forEach((user: any)=> {
                if(userScreenName == user.screen_name) {
                  seachResultsJsx_.push(
                    <Grid item xs={2}>
                      <TwitterCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="2000px" contentsText={tweetText} />
                    </Grid>
                  )
                  nTweetsImage += 1
                }
              })          
            }
            else {
              seachResultsJsx_.push(
                <Grid item xs={2}>
                  <TwitterCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="2000px" contentsText={tweetText} />
                </Grid>
              )        
              nTweetsImage += 1    
            }

          setSeachResultsJsx(seachResultsJsx_)
          setSearchMessage("画像つきツイート数 : " + nTweetsImage)
          })
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

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "auth.currentUser : ", auth.currentUser )
  console.log( "searchWord : ", searchWord )
  console.log( "searchWordProfile : ", searchWordProfile )
  //console.log("seachResultsJsx : ", seachResultsJsx)
  //console.log( "seachHistorys : ", seachHistorys )
  console.log( "seachResultsUsers : ", seachResultsUsers )
  return (
    <ThemeProvider theme={theme}>
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" selectedTabIdx={0} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}/>
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
      {/* 検索ヒット画像 */}
      <Box m={1}>
        <Grid container spacing={2}>
          {seachResultsJsx}
        </Grid>
      </Box>
    </ThemeProvider>
    );
}

export default HomePage;
