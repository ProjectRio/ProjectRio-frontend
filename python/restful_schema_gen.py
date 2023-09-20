import glob
import csv
import json
# # Specify the directory path where your Flask source code files are located
source_code_directory = 'C:/Users/micah/WebstormProjects/rioSkeleton/rioskeleton/python/ProjectRio-web/app/views/'

# Use glob to get a list of all Python files in the directory
python_files = glob.glob(source_code_directory + '*.py')

post_body = {}
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


            # Print or store the extracted data as per your requirements
            if "POST" in url_path:
                # print('URL Path:', url_path)
                split_path = url_path.split('(')[1].split(',')[0].strip().strip("'").strip('"')
                # print(split_path)
                post_body[split_path] = set()
                for line in lines:
                    if "request.json" in line:
                        if "=" in line:
                            variable_name = line.split('=', 1)[0].strip()
                            # print(variable_name)
                            data = line.split('=', 1)[1]
                            # print(data)
                            if 'request.json[' in data:
                                val = data.split('[')[1].split(']')[0]
                                # print(val)
                                post_body[split_path].add(val.strip("'").strip('"'))
                            elif 'in request.json' in data:
                                split = data.split(' ')
                                index = split.index('in')
                                arg = split[index - 1]
                                # print(arg)
                                post_body[split_path].add(arg.strip("'").strip('"'))
                            # elif 'request.json.get' in data:
                            #     split = data.strip() # .split(' ')[0]
                            #     print(split)
                            # request_data = data.split('request.json')[1]
                            # print(request_data)
                            # print()
            # print()
            # print('HTTP Methods:', http_methods)
            # print('Extracted Data:', extracted_data)
            # print('---')
for k, v in post_body.items():
    k = k.strip("'")
    for i in v:
        i = i.strip("'")

for k, v in post_body.items():
    print(k)
    for i in v:
        print(i)
    print()
    
output_csv_file = 'C:/Users/micah/WebstormProjects/rioSkeleton/rioskeleton/python/output.csv'
output_json_file = 'C:/Users/micah/WebstormProjects/rioSkeleton/rioskeleton/python/output_json.csv'


with open(output_csv_file, 'w', newline='') as file:
    writer = csv.writer(file)
        # Iterate through the data
    for key, value in post_body.items():
        row = [key]
        for i in value:
            row.append(i)

        # Write the row to the CSV file
        writer.writerow(row)

input_csv_file = output_csv_file


# Open the CSV file in read mode
with open(input_csv_file, 'r') as file:
    reader = csv.reader(file)

    # Prepare data list to hold each row's data
    data = []

    # Iterate through each row in the CSV
    for row in reader:
        endpoint = row[0]

        # Convert the row to a dictionary
        # row_data = {endpoint: row[1:]}
        # row_data = {endpoint: dict(enumerate(row[1:], start=1))}
        # row_data = {endpoint: {arg: "string" for i, arg in enumerate(row[1:], start=1)}}
        row_data = {endpoint: {arg: 0 if 'id' in arg else [] if 'list' in arg else "string" for i, arg in enumerate(row[1:], start=1)}}



        # Append the row data to the data list
        data.append(row_data)

edited_data = {}
for i in data:
    for k, v in i.items():
        print(k, v)
        edited_data[k] = v
        
# Write the data to the JSON file
with open('C:/Users/micah/WebstormProjects/rioSkeleton/rioskeleton/python/endpoints.json', 'w') as json_file:
    
    json.dump(edited_data, json_file, indent=4)

print(f"JSON file 'endpoints.json' generated successfully.")

