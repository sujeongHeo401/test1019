from datetime import date, timedelta
from multiprocessing import Pool

def daterange(start_date, end_date): 
    for n in range(int((end_date - start_date).days)): 
        yield start_date + timedelta(n)

start_date = date(2020, 12, 10) # 네이버 랭크 뉴스 이때부터 시작합
end_date = date(2021, 10, 22) 
datelist = []
for single_date in daterange(start_date, end_date):
    datelist.append(single_date)
print(datelist)