import logo from './logo.svg';
import { getNewsList } from "./utils";
import './App.css';
import React, { useEffect, useState } from 'react';
 

function App() {
  const [listVal, setListVal] = useState([]);
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState(null);
  const [recommendNews, setRecommendNews] = useState([]);
  useEffect(()=>{
    getListFromNeo4j();
  },[]);
  

  const getListFromNeo4j = async() => {
   const a = await getNewsList();
   setListVal(a);
  }
  
  const clickNews = (value) => {
    setRecommendNews([]); //초기화
    console.log("value:" ,value);
    setRecommendNews(['추천 뉴스1', '추천 뉴스2', '추천 뉴스3']);

  }

  const keywordChange = (val) =>{
    console.log("keyword 바꼈다!! ", val);
    setSearchKeyword(val.target.value);
    console.log("searchKeyword: ", searchKeyword);
  }

  const searchByKeyword =() => {
    console.log("최종 keyword, 이걸 이제 server 로 넘길 예정 .. ");
    console.log("seachKeyword: ", searchKeyword);
  }




  let brr = listVal.map((value, key) => <li key = {key} onClick={() => clickNews(value)} style={{cursor:'pointer'}}>{value[0].properties.title}</li>);
  // let testList = ['뉴스1', '뉴스2', '뉴스3', '뉴스4']
  // let brr = testList.map((value, key) => <li onClick={() => clickNews(value)} style={{cursor:'pointer'}} key = {key}>{value}</li>);
  
  console.log("recommendNews", recommendNews);
  let recBrr = recommendNews ? recommendNews.map((value, key) => <li onClick={() => clickNews(value)} key = {key}>{value}</li>) : [];

  return (
    <>
      <div className="outer" style={{marginLeft:'auto', marginRight: 'auto',  padding: 20, width: '100%'}} >
          <input type="text"
              placeholder="keyword 입력😂" 
              maxLength='40'
              style={{"width" : "90%", "height": "10%"}}
              onChange={ keywordChange }  
          />
          <button type="submit">
            <i className="fa fa-sign-in" onClick={ searchByKeyword }></i>
          </button>
          <div> neo4j 뉴스 리스트</div>
          <div>
            <ul>
              {/* 리스트 생성 */}
              {brr}
            </ul>
          </div>
          <div className="whenClick" >
            <p>유사한 항목들</p>
            { recommendNews.length && 
              <>
                
                <ul>
                  {/* 리스트 생성 */}
                  {recBrr}
                </ul>
              </>
            }
             { !recommendNews.length && 
                <p>상단의 뉴스를 클릭하면 유사한  뉴스가 나옵니다</p>
            }
          </div>
      </div>
    </>
  );
}





export default App;
