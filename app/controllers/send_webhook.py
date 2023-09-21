import requests

def send_request(url, data, headers): 
    try: 
        with requests.post(url=url, headers=headers, json=data) as response: 
            if response.status_code == 200: 
                return response.json()
            else: 
                return None
    except Exception as e: 
        print(e)