from neo4j import GraphDatabase

""" make node & relationship"""
def add_news(tx, title, date, word):
    tx.run("MERGE (a:News {title: $title , date: $date,  word: $word})",
           title=title, date=date, word=word)

def add_word(tx):
    print("안와 ???!! ")
    result = tx.run("MATCH (a:News) "
           "UNWIND a.word as w "
           "MERGE (b:Word {name:w}) "
           "MERGE (a)-[r:Include]->(b)")
    print("result.single()[0]: ", result.single()[0])
    return result.single()[0]

def get_word_list(tx):
    print("안와 ???!! ")
    result = tx.run("MATCH (a:News) RETURN a.word, a.title LIMIT 3")
    values = []   
    for record in result:
        print("record: ", record)
        print("record: .values() ", record.values())
        values.append(record.values())
    return values