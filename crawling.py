import requests
from bs4 import BeautifulSoup as BS
import pandas as pd
import numpy as np
import re
from datetime import date, timedelta
from konlpy.tag import Kkma
from konlpy.tag import Komoran
from neo4j import GraphDatabase
from clean_text import clean_title_text, clean_text
from neo4j_func import add_news, add_word

kkma = Kkma()
komoran = Komoran()

class run_crawling:
    def __init__(self, crawlDate):
        self.crawlDate = crawlDate
        self.d_list = []
        self.df = None
        self.headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'}
    
    def get_news_content(self, reqCont, each_url):
        reqCont = requests.get(each_url, headers=self.headers).text
        soupGetContext = BS(reqCont, 'html.parser')
        each_news_content = soupGetContext.find(class_='_article_body_contents')
        return each_news_content.text if each_news_content !=None else None

    def make_data_frame(self):
        date = self.crawlDate.strftime("%Y%m%d")
        url = "https://news.naver.com/main/ranking/popularDay.nhn?date=" + date
        html = requests.get(url, headers=self.headers).text
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
                reqCont = requests.get(d['src'], headers=self.headers).text if requests.get(d['src'], headers=self.headers) !=None else None
                d['title'] = new.a.text if new.a.text != None else None
                d['date'] = date if date != None else None
                d['content'] = self.get_news_content(reqCont, d['src'])
                self.d_list.append(d)
        self.df  = pd.DataFrame(self.d_list)
        self.df['title_c'] = self.df.apply(clean_title_text, axis=1)
        self.df['word'] = ''
        for idx_line in range(len(self.df)):
            nouns_list = komoran.nouns(self.df['title_c'].loc[idx_line])
            nouns_list_c = [nouns for nouns in nouns_list if len(nouns) > 1]    # 한글자는 이상한게 많아서 2글자 이상
            # df.loc[[idx_line], 'keyword'] = set(nouns_list_c)
            self.df.at[idx_line, 'word'] = set(nouns_list_c) if len(set(nouns_list_c)) > 0 else {}
        self.df = self.df[self.df['media'] != '코리아헤럴드']    # 코리아헤럴드는 영어 제목임
        self.df = self.df[self.df['media'] != '주간경향']    # 주간경향은 같은 title이 많음
        self.df['title_c_neo4j'] = self.df.apply(clean_text, axis=1)
        
    def connect_and_add_to_neo4j(self):
        # self.df['title_c_neo4j'] = self.df.apply(clean_text, axis=1)
        greeter = GraphDatabase.driver("bolt://localhost:7687", auth=("test1019", "test1019"))  
        with greeter.session() as session:
            for idx in range(len(self.df)):
                session.write_transaction(add_news, title=self.df.iloc[idx]['title_c_neo4j'], date=self.df.iloc[idx]['date']
                                        ,word=list(self.df.iloc[idx]['word']))
            session.write_transaction(add_word)

""" 네이버 랭킹 뉴스 긁어오기 """
def daterange(start_date, end_date): 
    for n in range(int((end_date - start_date).days)): 
        yield start_date + timedelta(n)

if __name__ == "__main__":
    start_date = date(2020, 11, 16) # 네이버 랭크 뉴스 이때부터 시작합
    end_date = date(2021, 11, 17) 
    for single_date in daterange(start_date, end_date):
        a = run_crawling(single_date)
        a.make_data_frame()
        a.connect_and_add_to_neo4j()

