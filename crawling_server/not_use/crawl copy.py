import requests
from bs4 import BeautifulSoup as BS
import pandas as pd
import numpy as np
import re
from datetime import date, timedelta

"""" 개별 컨텐츠만 가져오기"""
def get_news_content(headers, url):
    reqCont = requests.get(url, headers=headers).text
    soupGetContext = BS(reqCont, 'html.parser')
    each_news_content = soupGetContext.find(class_='_article_body_contents')
    return each_news_content.text if each_news_content !=None else None

""" 네이버 랭킹 뉴스 긁어오기 """
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'}

d_list = []
start_date = date(2020, 11, 16) # 네이버 랭크 뉴스 이때부터 시작합
end_date = date(2021, 10, 21) 

def daterange(start_date, end_date): 
    for n in range(int((end_date - start_date).days)): 
        yield start_date + timedelta(n)

for single_date in daterange(start_date, end_date):
    date = single_date.strftime("%Y%m%d")
    url = "https://news.naver.com/main/ranking/popularDay.nhn?date=" + date
    html = requests.get(url, headers=headers).text
    soup = BS(html, 'html.parser') if html !=None else None
    ranking_total = soup.find_all(class_='rankingnews_box') if soup != None else None

    for item in ranking_total:
        media = item.a.strong.text if item.a.strong.text != None else None
        news = item.find_all(class_="list_content") if item.find_all(class_="list_content") != None else None
        for new in news:
            d = {}
            d['media'] = media if media else None
            d['src'] = "https://news.naver.com/" + new.a['href']
            # 내용 수집
            print("d['src'] : ", d['src'] )
            reqCont = requests.get(d['src'], headers=headers).text if requests.get(d['src'], headers=headers) !=None else None
            d['title'] = new.a.text if new.a.text != None else None
            d['date'] = date if date != None else None
            d['content'] = get_news_content(headers, d['src'])
            d_list.append(d)

df = pd.DataFrame(d_list)





df['title_c'] = df.apply(clean_title_text, axis=1)


""" 키워드 추출 from title """
from konlpy.tag import Kkma
from konlpy.tag import Komoran

kkma = Kkma()
komoran = Komoran()
df['word'] = ''
for idx_line in range(len(df)):
    nouns_list = komoran.nouns(df['title_c'].loc[idx_line])
    nouns_list_c = [nouns for nouns in nouns_list if len(nouns) > 1]    # 한글자는 이상한게 많아서 2글자 이상
    # df.loc[[idx_line], 'keyword'] = set(nouns_list_c)
    df.at[idx_line, 'word'] = set(nouns_list_c) if len(set(nouns_list_c)) > 0 else {}
df = df[df['media'] != '코리아헤럴드']    # 코리아헤럴드는 영어 제목임
df = df[df['media'] != '주간경향']    # 주간경향은 같은 title이 많음


df.to_csv('test.csv', index=False)

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

""" 한자와 공백 제거 """
# Neo4j -> Gephi 에서 parsing error의 원인이 될 수 있음
def clean_text_for_neo4j(row):
    text = row['title_c']
    text = re.sub(pattern='[^a-zA-Z0-9ㄱ-ㅣ가-힣]', repl='', string=text)
    # print("영어, 숫자, 한글만 포함 : ", text )
    return text

df['title_c_neo4j'] = df.apply(clean_text_for_neo4j, axis=1)



""" 연결 """
# Neo4j 브라우저에서 설정한 계정의 ID, PASSWORD를 통해 접속
greeter = GraphDatabase.driver("bolt://localhost:7687", auth=("test1019", "test1019"))  



""" 입력 """
# Cyper code를 이용,  크롤링한 Data를 DB에 입력
with greeter.session() as session:
    """ make node """
    for idx in range(len(df)):
        session.write_transaction(add_news, title=df.iloc[idx]['title_c_neo4j'], date=df.iloc[idx]['date']
                                  ,word=list(df.iloc[idx]['word']))
    session.write_transaction(add_word)