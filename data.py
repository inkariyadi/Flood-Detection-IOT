import requests
import json
response_API = requests.get('http://localhost:5000/api/getdata?picked_date=18/05/2022&start_time=16:02&end_time=16:57')
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
# print(wf_atas)

# hitung lama banjir naik dari sensor bawah ke atas
if(len(wf_atas)>0):
    detected_bawah = wf_bawah[0]['timestamp']
    menit_bawah = int(detected_bawah[14])*10+int(detected_bawah[15])
    print(menit_bawah)
    detected_atas = wf_atas[0]['timestamp']
    menit_atas = int(detected_atas[14])*10+int(detected_atas[15])
    print(menit_atas)
    time_diff= menit_atas - menit_bawah
    print(time_diff)


# algoritma K-means untuk menentukan banjir akan naik berapa lama
# berdasarkan rata-rata raindrops
from sklearn.cluster import KMeans
import numpy as np
# data dummy berisi array [a,b] dimana nilai a merupakan rata2 raindrop
# nilai b merupakan kategori lama air naik {0-> diatas 1hr ; 1 -> 30min-1hr ; 2 -> dibawah 30min}
X = np.array([[10, 0], [150, 2], [80, 1],[82, 1], [85, 1], [40, 0], [160, 2], [155, 2]])
kmeans = KMeans(n_clusters=3, random_state=0).fit(X)
print(kmeans.labels_)
# jika ingin memprediksi, nilai pertama merupakan nilai rata-rata raindrop hingga saat ini
# nilai kedua selalu diisi 0
print(kmeans.predict([[27, 0], [170, 0]]))




