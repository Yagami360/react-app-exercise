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

import AppRoutes, { ProfileSearchPageConfig } from '../Config'
import useLocalPersist from '../components/LocalPersist';
import Header from '../components/Header'

// Auth オブジェクトの作成
const auth: any = firebase.auth()

// Firestore にアクセスするためのオブジェクト作成
const firestore = firebase.firestore()

// プロフィール検索ページを表示するコンポーネント
const ProfileSearchPage: React.VFC = () => {
  //------------------------
  // フック
  //------------------------
  // 検索フォームの入力テキスト
  const [searchWordProfile, setSearchWordProfile] = useLocalPersist("twitter-image-search-app", "searchWordProfile", "")

  // 検索結果メッセージ
  const [searchMessage, setSearchMessage] = useState("")
  
  // 検索ヒット画像のリスト 
  const [seachResultsUsers, setSeachResultsUsers] = useState([]);
  const [seachResultsUsersJsx, setSeachResultsUsersJsx] = useState([]);
  const [seachHistorys, setSeachHistorys] = useState([]);

  // 副作用フック
  useEffect(() => {
    // 検索履歴
    if( auth.currentUser !== null && searchWordProfile != "" ) {
      firestore.collection(ProfileSearchPageConfig.collectionNameSearchWord).doc(auth.currentUser.email).collection(ProfileSearchPageConfig.collectionNameSearchWord).get().then( (snapshot)=> {
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
      if( auth.currentUser !== null ) {
        // 新規に追加するドキュメントデータ
        const document = {
          searchWord: searchWordProfile, 
          time: new Date(),   
        }
        firestore.collection(ProfileSearchPageConfig.collectionNameSearchWord).doc(auth.currentUser.email).collection(ProfileSearchPageConfig.collectionNameSearchWord).doc(searchWordProfile).set(document).then((ref: any) => {
          console.log("added search word in ", ProfileSearchPageConfig.collectionNameSearchWord)
        })
      }

      // Cloud Function 経由で TwitterAPI を叩いてツイート検索
      fetch(
        ProfileSearchPageConfig.cloudFunctionSearchUserUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "search_word" : searchWordProfile,
            "count": ProfileSearchPageConfig.searchCount,
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
      setSearchMessage("検索ワードを入力してください" ) 
    }

    //setSearchWord("")
  }

  //------------------------
  // JSX での表示処理
  //------------------------
  console.log( "auth.currentUser : ", auth.currentUser )
  console.log( "searchWordProfile : ", searchWordProfile )
  console.log( "seachResultsUsers : ", seachResultsUsers )
  return (
    <Box>
      {/* ヘッダー表示 */}      
      <Header title="Twitter Image Search App" selectedTabIdx={AppRoutes.profileSearchPage.index} photoURL={auth.currentUser !== null ? auth.currentUser.photoURL : ''}/>
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
      {/* 検索ヒット画像 */}
      <Box m={1}>
        <Grid container spacing={2}>
          {seachResultsUsersJsx}
        </Grid>
      </Box>
    </Box>
    );
}

export default ProfileSearchPage;
