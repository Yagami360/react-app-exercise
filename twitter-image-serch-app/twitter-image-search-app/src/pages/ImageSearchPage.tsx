import React from 'react';
import { useState, useEffect } from 'react'

import firebase from "firebase";
import '../firebase/initFirebase'

import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from '@material-ui/lab/Autocomplete';

import AppRoutes, { ImageSearchPageConfig } from '../Config'
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'
import TweetCard from '../components/TweetCard'

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// 画像検索ページを表示するコンポーネント
const ImageSearchPage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // 検索フォームの入力テキスト
  const [searchWord, setSearchWord] = useLocalPersist("twitter-image-search-app", "searchWord", "")

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const [seachResultsJsx, setSeachResultsJsx] = useState([]);
  const [seachHistorys, setSeachHistorys] = useState([]);

  // 副作用フック
  useEffect(() => {
    // 検索履歴
    if( auth.currentUser !== null && searchWord != "" ) {
      firestore.collection(ImageSearchPageConfig.collectionNameSearchWord).doc(auth.currentUser.email).collection(ImageSearchPageConfig.collectionNameSearchWord).get().then( (snapshot)=> {
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
      if( auth.currentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWord, 
          time: new Date(),   
        }
        firestore.collection(ImageSearchPageConfig.collectionNameSearchWord).doc(auth.currentUser.email).collection(ImageSearchPageConfig.collectionNameSearchWord).doc(searchWord).set(document).then((ref: any) => {
          console.log("added search word in ", ImageSearchPageConfig.collectionNameSearchWord)
        })
      }

      // Cloud Function 経由で TwitterAPI を叩いてツイート検索
      fetch(
        ImageSearchPageConfig.cloudFunctionSearchTweetUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "search_word" : searchWord + " filter:images",
            "count": ImageSearchPageConfig.searchCount,
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

            seachResultsJsx_.push(
              <Grid item xs={2}>
                <TweetCard userId={userId} userName={userName} userScreenName={userScreenName} profileImageUrl={profileImageUrl} tweetTime={tweetTime} tweetId={tweetId} imageFileUrl={imageUrl} imageHeight="300px" imageWidth="2000px" contentsText={tweetText} />
              </Grid>
            )        
            nTweetsImage += 1    
          })

          setSeachResultsJsx(seachResultsJsx_)
          setSearchMessage("画像つきツイート数 : " + nTweetsImage)
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
  //console.log("seachResultsJsx : ", seachResultsJsx)
  //console.log( "seachHistorys : ", seachHistorys )
  return (
    <Box>
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.imageSearchPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}/>
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
      {/* 検索ヒット画像 */}
      <Box m={1}>
        <Grid container spacing={2}>
          {seachResultsJsx}
        </Grid>
      </Box>
    </Box>
    );
}

export default ImageSearchPage;