import json
import requests
import subprocess
import os

script_dir = os.path.dirname(os.path.realpath(__file__))

config_path = os.path.join(script_dir, 'config.json')
with open(config_path) as config_file:
    config = json.load(config_file)

username = config['username']
key = config['key']

url = 'https://syntic-77bw.onrender.com/api/verify'

# Data na ipapasa sa verification endpoint
data = {
    'username': username,
    'key': key
}

# Pag-send ng POST request para i-verify ang key
response = requests.post(url, json=data)

if response.json().get('valid'):
    print("Key is approved. proceeding!!")
    # Patakbuhin ang npm start
    subprocess.run(['npm', 'run', 'approved'])
else:
    print("Invalid key or key not approved.")
