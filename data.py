import requests
import json
response_API = requests.get('http://localhost:5000/api/getdata?picked_date=11/04/2022&start_time=11:18&end_time=11:18')
#print(response_API.status_code)
data = response_API.text
parse_json = json.loads(data)
# print(parse_json)
wf_atas = parse_json['sensor_waterlevel_atas']
wf_bawah = parse_json['sensor_waterlevel_bawah']
raindrop = parse_json['sensor_raindrop']
# print(len(raindrop))

# hitung rata-rata raindrop
total_raindrop=0
for i in range(len(raindrop)):
    total_raindrop+=raindrop[i]['data']
    # print(raindrop[i]['data'])

avg_raindrop = total_raindrop/(len(raindrop))

print(avg_raindrop)




