import urllib.request
import urllib.parse
import json

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name=\"file\"; filename=\"test.jpg\"\r\n'
    'Content-Type: image/jpeg\r\n\r\n'
).encode('utf-8')
with open('c:/expo-project/mobile-digital-printing/golang-api/uploads/designs/1780111609039451700_upload.jpg', 'rb') as f:
    body += f.read()
body += ('\r\n--' + boundary + '--\r\n').encode('utf-8')

req = urllib.request.Request('http://localhost:5000/predict-blur', data=body)
req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
