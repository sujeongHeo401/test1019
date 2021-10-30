import logo from './logo.svg';
import { getNewsList, recommendByWord, recommendByNews, recommendByCommunityDetection, recommendByPageRank, recommendByNodeSimilarity} from "./utils";
import './App.css';
import React, { useEffect, useState } from 'react';
 

function App() {
  const [listVal, setListVal] = useState([]);
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState(null);
  const [recommendNews, setRecommendNews] = useState([]);
  const [recoBySimilarity, setRecoBySimilarity] = useState([]);
  const [recommendNewsByCommunityDetection, setRecommendNewsByCommunityDetection] = useState([]);
  useEffect(()=>{
    getListFromNeo4j(page);
  },[]);
  

  const getListFromNeo4j = async(page) => {
   const a = await getNewsList(page);
   setListVal(a);
  }
  
  const clickNews = async(value) => {
    setRecommendNews([]); //초기화
    console.log("value:" ,value);
    let recByNews = await recommendByNews(value);
    let recNewSimilarity = await recommendByNodeSimilarity(value);
    console.log("recByNewsSimilarity: ", recNewSimilarity);
    let recByNewsCommunityDetection = await recommendByCommunityDetection(value);
    setRecommendNews(recByNews);
    setRecoBySimilarity(recNewSimilarity);
    setRecommendNewsByCommunityDetection(recByNewsCommunityDetection);
  }

  const keywordChange = (val) =>{
    console.log("keyword 바꼈다!! ", val);
    setSearchKeyword(val.target.value);
    console.log("searchKeyword: ", searchKeyword);
  }

  const searchByKeyword = async () => {
    console.log("최종 keyword, 이걸 이제 server 로 넘길 예정 .. ");
    console.log("seachKeyword: ", searchKeyword);
    let b = await recommendByWord(searchKeyword);
    setRecommendNews(b);

  }

  const prevtBtn = () => {
    if (page - 1 >= 0){
      getListFromNeo4j(page - 1);
      setPage(page - 1);
      
    }
  }

  const nextBtn = () => {
    getListFromNeo4j(page + 1);
    setPage(page + 1);
  }
  

  let brr = listVal?listVal.map((value, key) => <tr key = {key} ><td key = {key} onClick={() => clickNews(value[0].properties.title)} style={{cursor:'pointer', border: '1px solid black'}}>{value[0].properties.title}</td></tr>):[];
  // let testList = ['뉴스1', '뉴스2', '뉴스3', '뉴스4']
  // let brr = testList.map((value, key) => <li onClick={() => clickNews(value)} style={{cursor:'pointer'}} key = {key}>{value}</li>);
  
  console.log("recommendNews", recommendNews);
  let recBrr = recommendNews?recommendNews.map((value, key) => <li key = {key}>{value[0]}</li>):[];
  let recBrrSimilarity = recoBySimilarity?recoBySimilarity.map((value, key) => <li key = {key}>{value[0].properties.title}</li>):[];
  let recBrrCommunityDetection = recommendNewsByCommunityDetection?recommendNewsByCommunityDetection.map((value, key) => <li key = {key}>{value[0]}</li>):[];

  return (
    <>
      <div className="outer" style={{marginLeft:'auto', marginRight: 'auto',  padding: 20, width: '100%'}} >
        <div style={{"marginBottom": 10}} >과제</div>
          <input type="text"
              placeholder="keyword 입력" 
              maxLength='20'
              style={{"width" : "40%", "height": "10%", "marginBottom": 10}}
              onChange={ keywordChange }  
          />
          <button type="submit">
            <i className="fa fa-sign-in" onClick={searchByKeyword}></i>
          </button>
          <div>
            <table> 
              <tr>
                <th>neo4j 뉴스 리스트</th>
              </tr>
              {/* 리스트 생성 */}
              {brr}
            </table>
          </div>
          <button onClick={prevtBtn}>prev</button>
          <span>{page}</span>
          <button onClick={nextBtn}>next</button>
          <div className="whenClick"  style={{display:'flex'}}>
            <div style ={{ border : '1px solid black', marginRight: 10}}>
              <p><b>비슷한 뉴스</b></p>
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
            <div style ={{ border : '1px solid black', marginRight: 10}}>
              <p><b>비슷한 뉴스 /w similarity </b></p>
              { recoBySimilarity.length && 
                <>
                  
                  <ul>
                    {/* 리스트 생성 */}
                    {recBrrSimilarity}
                  </ul>
                </>
              }
              { !recoBySimilarity.length && 
                  <p>상단의 뉴스를 클릭하면 유사한  뉴스가 나옵니다</p>
              }
            </div>
            <div style ={{ border : '1px solid black', marginRight: 10}}>
              <p><b>비슷한 뉴스 /w community detection</b></p>
              { recommendNewsByCommunityDetection.length && 
                <>
                  
                  <ul>
                    {/* 리스트 생성 */}
                    {recBrrCommunityDetection}
                  </ul>
                </>
              }
              { !recommendNewsByCommunityDetection.length && 
                  <p>상단의 뉴스를 클릭하면 유사한  뉴스가 나옵니다</p>
              }
            </div>
          </div>
      </div>
    </>
  );
}


export default App;
