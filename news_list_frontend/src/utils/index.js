const neo4j = require('neo4j-driver');
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("test1019", "test1019"));
export const  getNewsList = async() => {
    let session = driver.session();
    console.log("sdfsdf");
    let skipNum = 0;

    try {
      const result = await session.run(
        'MATCH (a:News) RETURN a LIMIT 10',
      )

      return result.records.map((ele) => {
        return ele._fields  
      })
      

      // console.log(node.properties.name)
    } catch {
      console.log("세션 닫혔음 .. ");
      return [];
    } finally {
      console.log("오지 ???")
      await session.close();
    }

  }

  export const  recommendByWord = async(word) => {
    let session = driver.session();
    console.log("입력 받은 단어 : ", word);
    console.log("안 오냐 ????");
    try {
      const result =await session.run(
        'MATCH (word:Word {name: "' + String(word) + '"})<-[:Include]-(news:News)' + 
        'RETURN DISTINCT news.title, news.word ORDER BY size(news.word) LIMIT 10'
      );

      console.log("result: ", result);
      return result.records.map((ele) => {
        return ele._fields  
      })
    } catch (err){
      console.log("세션 닫혔음 .. ", err);
      return [];
    } finally {
      console.log("오지 ???")
      await session.close()
    }

  }

  export const  recommendByNews = async(word) => {
    let session = driver.session();
    console.log("입력 받은 단어 : ", word);
    console.log("안 오냐 ????");
    try {
      const result =await session.run(
        'MATCH (news:News {title: "' + String(word) + '"})<-[:Include]->(word:Word)<-[:Include]-(otherNews:News)' + 
        'RETURN otherNews.title, count(word) ORDER BY count(word) DESC LIMIT 10'
      );

      console.log("result: ", result);
      return result.records.map((ele) => {
        return ele._fields  
      })
    } catch (err){
      console.log("세션 닫혔음 .. ", err);
      return [];
    } finally {
      console.log("오지 ???")
      await session.close()
    }

  }