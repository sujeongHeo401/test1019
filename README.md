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
![캡처](/file/pic111.jpg)

### 화면  예시
![capture](/file/1026_과제화면.gif)



______________________

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
        ________________________________________________________________

        2. gds.graph 설정 For page rank


            - gds.graph.create 에러 

            - neo4j 설정 변경
            
            ```
                dbms.security.procedures.unrestricted=algo.*,apoc.*, gds.*
            ```

            cypher1 : graph 생성

            ```
                CALL gds.graph.create('News_Inter', 'News', 'Inter', {relationshipProperties: 'w'})
            ```

            cypher2: 노드에 속성 적용
            
            ```
                CALL gds.pageRank.write('News_Inter', 
                {maxIterations: 20, dampingFactor: 0.85, relationshipWeightProperty: 'w', writeProperty: 'pagerank'})
                YIELD nodePropertiesWritten, ranIterations
            ```
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