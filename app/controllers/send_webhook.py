from requests.exceptions import HTTPError
import requests

def send_request(url, data, headers): 
    try: 
        with requests.post(url=url, headers=headers, json=data) as response: 
           return response
    except HTTPError as e: 
        print(e.response.text)
    except Exception as e: 
        print(e)