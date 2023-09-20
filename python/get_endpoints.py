import glob
import json
import requests

# Specify the directory path where your Flask source code files are located
source_code_directory = 'C:/Users/micah/WebstormProjects/rioSkeleton/rioskeleton/python/ProjectRio-web/app/views/'

# Use glob to get a list of all Python files in the directory
python_files = glob.glob(source_code_directory + '*.py')

get_endpoints = {}  # Dictionary to store GET endpoints

# Iterate through each Python file
for file_path in python_files:
    with open(file_path, 'r') as file:
        content = file.read()
        endpoints = content.split('@app.route')[1:]  # Split at every occurrence of '@app.route'

        # Process each endpoint
        for endpoint in endpoints:
            # Extract relevant data about the endpoint
            # You can parse the endpoint data using regular expressions or string operations
            # For example, you can extract the URL path, HTTP methods, etc.
            # Here's a basic example using string splitting
            lines = endpoint.split('\n')
            url_path = lines[0].strip()

            # Check if it's a GET endpoint
            if "GET" in url_path and "POST" not in url_path:
                # Extract and store the endpoint URL path
                split_path = url_path.split('(')[1].split(',')[0].strip().strip("'").strip('"')
                get_endpoints[split_path] = set()


# Function to make a GET request to an endpoint and check for errors
def check_endpoint(endpoint):
    if "data" in endpoint:
        url = f"http://api.projectrio.app/{endpoint}/?limit_games=1"  # Replace with your server address
    else:
        url = f"http://api.projectrio.app{endpoint}"  # Replace with your server address
    response = requests.get(url)
    
    if response.status_code == 200:
        return True  # Request was successful
    elif response.status_code == 404:
        return "Page does not exist."
    else:
        return False  # Request encountered an error

# Check each GET endpoint and print the result
for endpoint in get_endpoints.keys():
    result = check_endpoint(endpoint)
    print(f"Endpoint: {endpoint}, Success: {result}")
