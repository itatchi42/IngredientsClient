import grequests
import requests 
import json
import time

def exception_handler(req, exception):
	print('Request failed')
	print(req)

postEndpoint = 'http://localhost:3000/add-ingredients/'
getEndpoint = 'http://localhost:3000/ingredient/'

with open ('database.json', encoding = 'utf8') as file:
	data = json.load(file)

print('finished reading dataaset JSON!')


#Async, multithreaded version:
#Test adding all elements to Dynamodb
allIngredients = []
for (k, v) in data.items():
	y = json.dumps(v)
	offset = '"tags": '
	openCurlyIndx = y.index(offset) + len(offset)
	#Insert key in beginning of str and change {} to []
	line = '{"key" : "' + str(k) + '", ' + y[1 : openCurlyIndx] \
	+ '[' + y[openCurlyIndx : -1] + ']}'
	#Properly escape, does nothing if '\\' not found
	line = line.replace('\\', '\\\\')
	ingredient = json.loads(line)
	allIngredients.append(ingredient)
	
postReqs = (grequests.post(url = postEndpoint, json = myIngredient, timeout = 5) for myIngredient in allIngredients)
postReqMap = grequests.map(postReqs, exception_handler = exception_handler)
for indx, resp in enumerate(postReqMap):
	try:
		if resp.status_code != 200: 
			print(indx, resp)
			print(allIngredients[indx]) #Print corresp. request
			time.sleep(3) #Wait three sec to see if that helps...
			retryResp = requests.post(url = postEndpoint, json = allIngredients[indx], timeout = 5) #Retry
			assert retryResp.status_code == 200
	except:
		print(indx, resp)
		print(allIngredients[indx])
		input('Press key to continue...')



#Test retrieval of all elements from Dynamodb
allKeys = []
for (k, v) in data.items():
	allKeys.append(str(k).replace('/', '%2F')) #Does nothing if '/' not in string
	
getReqs = (grequests.get(url = getEndpoint + key, timeout = 5) for key in allKeys)
getReqMap = grequests.map(getReqs, exception_handler = exception_handler)
for indx, resp in enumerate(getReqMap):
	if resp.status_code != 200: 
		print(indx, resp)
		print(allKeys[indx])
		time.sleep(3) 
		retryResp = requests.get(url = getEndpoint + allKeys[indx], timeout = 5)
		assert retryResp.status_code == 200


print("Finished submit and retrieve tests!")
#Serial version:
#Test adding all elements to Dynamodb
# for (k, v) in data.items():
# 	y = json.dumps(v)
# 	offset = '"tags": '
# 	openCurlyIndx = y.index(offset) + len(offset)
# 	#Insert key in beginning of str and change {} to []
# 	line = '{"key" : "' + str(k) + '", ' + y[1 : openCurlyIndx] \
# 	+ '[' + y[openCurlyIndx : -1] + ']}'
# 	ingredient = json.loads(line)
# 	resp = requests.post(url = postEndpoint, json = ingredient)
# 	assert resp.status_code == 200

# #Test retrieval of all elements from Dynamodb
# for (k, v) in data.items():
# 	resp = requests.get(getEndpoint + str(k))
# 	assert resp.status_code == 200






# References:
# 	1. requests (serial http reqs): https://2.python-requests.org/en/master/
# 	2. grequests (async, multithreaded http reqs): https://github.com/kennethreitz/grequests


