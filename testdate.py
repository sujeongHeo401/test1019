from datetime import date, timedelta

def daterange(start_date, end_date): 
    for n in range(int((end_date - start_date).days)): yield start_date + timedelta(n)

start_data = 20210101
end_data = 20210116

start_date = date(2020, 11, 16) 
end_date = date(2021, 10, 21) 
for single_date in daterange(start_date, end_date):
     print(single_date.strftime("%Y%m%d"))