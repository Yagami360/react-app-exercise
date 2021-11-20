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

const cloudFunctionUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweet"
//const cloudFunctionUrl: string = "https://us-central1-twitter-image-search-app.cloudfunctions.net/searchTweetRecursive"
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

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const [seachResults, setSeachResults] = useState();
  const [seachResultsJsx, setSeachResultsJsx] = useState();
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
  }, [searchWord, seachResults, seachResultsJsx])

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

    // 検索履歴のデータベースに追加
    if( auth.currentUser !== null && searchWord != "" ) {
      // 新規に追加するドキュメントデータ
      const document = {
        searchWord: searchWord, 
        time: new Date(),   
      }
      firestore.collection(collectionNameSearchWord).doc(auth.currentUser.email).collection(collectionNameSearchWord).doc(searchWord).set(document).then((ref: any) => {
        console.log("added search word in search-word-database")
      })
    }

    // Cloud Funtion 経由で Twitter API を呼び出す（Cloud Funtion をリバースプロキシとして利用）
    // Ajax 通信をするために、fetch API を使用（他にも axios を使用する方法もある）
    // fetch() は非同期処理でのリクエストメソッドで戻り値は Promise なので、then() メソッド内にリクエスト処理完了後の処理を定義する
    fetch(
      cloudFunctionUrl,
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
        //console.log("data : ", data)
        const tweets = data["tweets"]
        const statuses = tweets["statuses"]
        let nTweetsImage = 0
        //console.log("tweets : ", tweets)
        //console.log("statuses : ", statuses)

        let seachResultsJsx_: any = []
        statuses.forEach((statuse: any)=> {
          //console.log("statuse : ", statuse)
          let imageUrl = "" 
          if (statuse["entities"]["media"] && statuse["entities"]["media"].indexOf(0)) {
            if(statuse["entities"]["media"][0]["media_url"]) {
              imageUrl = statuse["entities"]["media"][0]["media_url"]
            }
            else if(statuse["entities"]["media"][0]["media_url_https"]) {
              imageUrl = statuse["entities"]["media"][0]["media_url_https"]
            }
            nTweetsImage += 1
          }
          else if (statuse["extended_entities"] && statuse["extended_entities"]["media"] && statuse["extended_entities"]["media"].indexOf(0)) {
            if(statuse["extended_entities"]["media"][0]["media_url"]) {
              imageUrl = statuse["extended_entities"]["media"][0]["media_url"]
            }
            else if(statuse["extended_entities"]["media"][0]["media_url_https"]) {
              imageUrl = statuse["extended_entities"]["media"][0]["media_url_https"]
            }
            nTweetsImage += 1
          }
          else {
            return
          }
          //console.log("imageUrl : ", imageUrl)

          const userId = statuse["user"]["id_str"]
          const userName = statuse["user"]["name"]
          const userScreenName = statuse["user"]["screen_name"]
          const profileImageUrl = statuse["user"]["profile_image_url"]
          const tweetTime = statuse["created_at"].replace("+0000","")
          const tweetText = statuse["text"]
          const tweetId = statuse["id_str"]
          //console.log("profileImageUrl : ", profileImageUrl)

          seachResultsJsx_.push(
            <Grid item xs={10} sm={2}>
              <TwitterCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="300px" contentsText={tweetText} />
            </Grid>
          )
        })
        setSeachResultsJsx(seachResultsJsx_)
        setSearchMessage("画像つきツイート数 : " + nTweetsImage + "/" + searchCount)
      })
      .catch((reason) => {
        console.log("ツイートの取得に失敗しました", reason)
        setSearchMessage("ツイートの取得に失敗しました : " + reason )
      });

    // 入力フォームのテキストをクリア
    //setSearchWord("")
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "searchWord : ", searchWord )
  //console.log("seachResultsJsx : ", seachResultsJsx)
  //console.log( "seachHistorys : ", seachHistorys )
  return (
    <ThemeProvider theme={theme}>
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" />
      {/* 検索ワード入力 */}
      <form onSubmit={onSubmitSearchWord}>
        <Box p={1} m={1} >
          <Grid container={true}>
            {/* <Autocomplete disableClearable > : x */}
            {/* <TextField> : InputProps 属性の startAdornment キーで検索アイコン付きの入力フォームにする */}
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
              style={{ width: 270 }}
            />
            <Button type="submit" variant="contained" style={{ width: 100, borderRadius: 25 }}>
              <Typography variant="subtitle1">🔍 検索</Typography>
            </Button>
          </Grid>
          <Typography variant="subtitle2">{searchMessage}</Typography>
        </Box>
      </form>
      {/* 検索ヒット画像 */}
      <Grid container direction="column">
        <Grid item container spacing={2}>
            {seachResultsJsx}
        </Grid>
      </Grid>
    </ThemeProvider>
    );
}

export default HomePage;
