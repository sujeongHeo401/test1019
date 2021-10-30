const neo4j = require('neo4j-driver');
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("test1028", "test1028"));
export const  getNewsList = async(page) => {
    let session = driver.session();
    console.log("sdfsdf");
    try {
      const result = await session.run(
        'MATCH (a:News) RETURN a SKIP ' + page*10 + ' LIMIT 10',
      )

      return result.records.map((ele) => {
        return ele._fields  
      })
      // console.log(node.properties.name)
    } catch(err) {
      console.log("err: ", err);
      console.log("세션 닫혔음 .. ");
      return [];
    } finally {
      await session.close();
    }

  }

  export const  recommendByWord = async(word) => {
    let session = driver.session();
    console.log("입력 받은 단어 : ", word);
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
      await session.close();
    }

  }

  export const  recommendByNews = async(title) => {
    let session = driver.session();
    console.log("입력 받은 단어 : ", title);
    console.log("안 오냐 ????");
    try {
      const result =await session.run(
        'MATCH (news:News {title: "' + String(title) + '"})<-[:Include]->(word:Word)<-[:Include]-(otherNews:News)' + 
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

  export const  recommendByPageRank = async(title) => {
    let session = driver.session();
    try {
      const result =await session.run(
        `MATCH (n:News)
        WHERE n.title = "${title}" 
        WITH n.pagerank as npg
        MATCH (otherNews: News)
        WHERE otherNews.pagerank >= npg 
        RETURN otherNews ORDER BY otherNews.pagerank ASC  LIMIT 5
        UNION ALL
        MATCH (n:News)
        WHERE n.title = "${title}"  
        WITH n.pagerank as npg
        MATCH (otherNews: News)
        WHERE otherNews.pagerank <= npg 
        RETURN DISTINCT otherNews ORDER BY otherNews.pagerank LIMIT 5`
      );

      console.log("result: ", result.records.map((ele) => {
        return ele._fields  
      }));
      return result.records.map((ele) => {
        return ele._fields  
      })
    } catch (err){
      console.log("세션 닫혔음 .. ", err);
      return [];
    } finally {
      console.log("오지 ???");
      await session.close();
    }

  }

  export const  recommendByNodeSimilarity = async(title) => {
    let session = driver.session();
    try {
      // const result =await session.run(
      // `CALL gds.nodeSimilarity.stream('News_Inter', { topK: 10 })
      //   YIELD node1, node2, similarity
      //   WHERE gds.util.asNode(node1).title = '${title}'
      //   RETURN gds.util.asNode(node1).title AS News1, gds.util.asNode(node2).title AS News2, similarity
      //   ORDER BY News1`
      // );
      const result =await session.run(
          `MATCH (a:News {title: '${title}'})-[r:SIMILAR]->(b:News)
          WHERE a <> b WITH r, b
          RETURN b ORDER BY r.score DESC LIMIT 10`
        );

      console.log(" recommendByNodeSimilarity result: ", result.records.map((ele) => {
        return ele._fields  
      }));
      return result.records.map((ele) => {
        return ele._fields  
      })
    } catch (err){
      console.log("세션 닫혔음 .. ", err);
      return [];
    } finally {
      console.log("오지 ???");
      await session.close();
    }

  }

  export const  recommendByCommunityDetection = async(title) => {
    let session = driver.session();
    console.log("입력 받은 단어 : ", title);
    console.log("안 오냐 ????");
    try {
      const result =await session.run(
        `MATCH (n: News{title: "${title}"}), (n1: News)
        WHERE  n1.title <> n.title and n1.community =  n.community
        return DISTINCT n1.title, count(n1) LIMIT 10`
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