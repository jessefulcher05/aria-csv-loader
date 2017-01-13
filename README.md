 # Aria CSV Loader
 application takes a CSV file and submits it to Aria Systems via API

## Required Setup
The header of the CSV must match the API input parameters of a given API
Create a file named .env in the root directory and populate it with the following (comments are optional):

```
# name of file which must reside in files/input/
CSV_FILENAME=my_file.csv
# Number of times to process the file
ITERATIONS=1
# exact name of the api
API_NAME=create_usage_m
# api types. core, admintools, object
API_TYPE=core
# should be one of the following: SC, PROD, SF_CPH, PROD_CPH
ENV=SF
# Aria client number
CLIENT_NO=123456
# Auth key for the Aria client
AUTH_KEY=12325desdsv3r232e
# Number of concurrent api requests made to Aria
THREADS=50
# Determines how often a status message will be printed to the console 
PRINT_OUTPUT_COUNT=100
```

## Running Application
Place an input CSV in files/input and ensure the filename matches the name in .env
* Ensure all .env parameters are configured correctly - read more about [dotenv](https://github.com/motdotla/dotenv)
* Ensure [nodejs](https://nodejs.org/en/) is installed and can be access from the command line using `node --version`
### Visual Studio (Recommended for users not familiar with NodeJS)
* from the command line, open the directory and type `npm install` to install all dependencies. This application will not run unless this step is completed.
* Download [Visual Studio Code](https://code.visualstudio.com/)
* Open project folder
* Ensure that .vscode/launch.json exists. If not, when you attmpt to run just accept the defaults and ensure it is pointig to app.js (example below)
* Press F5 to run the application
### Command Line
* **Note:** you can place breakpoints to pause at any step along the way and look at the data
* Run the applciation with `node app.js` or `npm start`
### Visual Studio Code Run Configuration


```
{
  // Use IntelliSense to learn about possible Node.js debug attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceRoot}/app.js",
      "cwd": "${workspaceRoot}"
    }
  ]
}
```
