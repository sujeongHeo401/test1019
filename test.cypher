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