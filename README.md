
### tf-idf 벡터 적용 cypher (news->[r:Include]->Word)
```
CALL apoc.periodic.iterate(
'MATCH (:News) WITH count(*) AS totalNews 
 MATCH (a1:News) UNWIND a1.word AS awd match (w:Word {name: awd}),
 (n:News) WHERE ID(n) = ID(a1) RETURN w, n, totalNews',
'WITH n, w, totalNews,size((n)-[:Include]->(w)) AS occurrencesInNews, 
 size((n)-[:Include]->()) AS wordsInNews, 
 size(()-[:Include]->(w)) AS newsWithWord WITH n, w, totalNews, 
 1.0 * occurrencesInNews / wordsInNews AS tf, 
 log10( totalNews / newsWithWord ) AS idf 
  MERGE (n)-[r:Include]->(w) SET r.score = tf * idf',{batchSize: 10000}) YIELD batch, operations
```
### cosine similarity 예시
```
MATCH (n1:News {title: '전기차시대달라지는자동차디자인과변하지않는요소들김도형기자의휴일차담'})-[include1:Include]->(word)
MATCH (n2:News)-[include2:Include]->(word) WHERE n2 <> n1 and include1.score IS NOT NULL and include2.score IS NOT NULL
RETURN n1.title AS from,
       n2.title AS to,
       gds.alpha.similarity.cosine(collect(include1.score), collect(include2.score)) AS similarity
ORDER BY similarity DESC LIMIT 10
```


### 크롤러 실행법

```
cd crawling_server

pip install 

python crawling_server/crawling.py

```

### 프론트 엔드 실행법

```
cd news_list_frontend

npm install

npm run start
```
__________________________________________________

### GDSL 통한 유사 뉴스 추천  1. PageRank
##### - 클릭한 뉴스의 페이지 랭크 값과 비슷한 페이지 랭크 값을 가진 뉴스 10개 
##### cypher code 

```
MATCH (n:News)
WHERE n.title = "코로나19신규확진자450명주말검사량감안하면확산세여전" 
WITH n.pagerank as npg
MATCH (otherNews: News)
WHERE otherNews.pagerank >= npg 
RETURN otherNews ORDER BY otherNews.pagerank ASC  LIMIT 5
UNION ALL
MATCH (n:News)
WHERE n.title = "코로나19신규확진자450명주말검사량감안하면확산세여전" 
WITH n.pagerank as npg
MATCH (otherNews: News)
WHERE otherNews.pagerank <= npg 
RETURN otherNews ORDER BY otherNews.pagerank LIMIT 5
```
______________________________________________________

### GDSL 통한 유사 뉴스 추천  2. Community detection
##### - 클릭한 뉴스와 같은  커뮤니티에 속한 뉴스들을 보여준다
##### cypher code 

```
    MATCH (n: News{title: '성매매집결지파주용주골팔려간지적장애여성들'}), (n1: News)
    WHERE  n1.title <> n.title and n1.community =  n.community
    return n1 LIMIT 10
```

______________________________


### neo4j  예시
![캡처](/file_for_github_readmd/pic111.jpg)

### 화면  예시
![capture](/file_for_github_readmd/1026_과제화면.gif)



______________________

## 참고 
score 가 있는 지 없는 지 확인 
```
MATCH p=()-[r:Include]->() WHERE r.score IS NOT NULL
return p  LIMIT 100
```

## 참고
   https://adamcowley.co.uk/neo4j/calculating-tf-idf-score-cypher/


   https://code-ing.tistory.com/2?category=728528
    
    https://mons1220.tistory.com/249,
    https://konlpy-ko.readthedocs.io/ko/v0.4.3/


    에러 수정> konlpy 설치

    ```
    pip install JPype1-py3
    
    ```
    _______________________________
    GDSL (neo4j) 코드
        1. apoc.periodic.iterate


            - neo4j 설정 변경
            ```
                dbms.memory.heap.initial_size=2G
                dbms.memory.heap.max_size=5G

            ```
            cypher code 

            ```
                CALL apoc.periodic.iterate(
                'MATCH (a:News)-[:Include]->(:Word)<-[:Include]-(b:News) WHERE id(a) > id(b)
                RETURN a, b, count(*) as weight',
                'MERGE (a)-[r:Inter]-(b)
                ON CREATE SET r.w = weight',
                {batchSize : 10000})
                YIELD batch, operations
            ```
            - neo4j 설정 변경
            
            ```
                dbms.security.procedures.unrestricted=algo.*,apoc.*, gds.*
            ```

            - cypher1 : graph 생성

            ```
                CALL gds.graph.create('News_Inter', 'News', 'Inter', {relationshipProperties: 'w'})
            ```
        ________________________________________________________________

        2. Node similarity 적용 
            
            ```
                 CALL gds.nodeSimilarity.write('News_Inter', {
                    writeRelationshipType: 'SIMILAR',
                    writeProperty: 'score'
                })
                YIELD nodesCompared, relationshipsWritten
            ```

            - topK 
            ```
                CALL gds.nodeSimilarity.stream('News_Inter', { topK: 10 })
                YIELD node1, node2, similarity
                RETURN gds.util.asNode(node1).title AS News1, gds.util.asNode(node2).title AS News2, similarity
                ORDER BY News1
            ```

            - topK ( 타이틀이 'ㅁㅁㅁㅁ' 인 뉴스와 비슷한 뉴스들 )
            
            ```
            CALL gds.nodeSimilarity.stream('News_Inter', { topK: 10 })
            YIELD node1, node2, similarity
            WHERE gds.util.asNode(node1).title = '1000만원씩동부구치소확진수용자들국가상대손배소'
            RETURN gds.util.asNode(node1).title AS News1, gds.util.asNode(node2).title AS News2, similarity
            ORDER BY News1
            ```
        _____________________________________________________________________________________________________
        
       

        CALL gds.nodeSimilarity.stream('News_Inter', { topK: 10 })
        YIELD node1, node2, similarity
        RETURN gds.util.asNode(node1).title AS News1, gds.util.asNode(node2).title AS News2, similarity
        ORDER BY News1


        ________________________________________________________________
        3. GDS - community detection (louvain)

            cypher 코드
            ```
                CALL gds.louvain.write('News_Inter', 
                {relationshipWeightProperty: 'w', writeProperty: 'community' })
                YIELD communityCount, modularity, modularities

            ```
            cypher 코드 
            ```
                MATCH (n: News)
                WHERE n.community = 3118
                RETURN n.title
                LIMIT 5 
            ```
