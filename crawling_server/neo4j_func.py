from neo4j import GraphDatabase

""" make node & relationship"""
def add_news(tx, title, date, word):
    tx.run("MERGE (a:News {title: $title , date: $date,  word: $word})",
           title=title, date=date, word=word)

def add_word(tx):
    tx.run("MATCH (a:News) "
           "UNWIND a.word as w "
           "MERGE (b:Word {name:w}) "
           "MERGE (a)-[r:Include]->(b)")
