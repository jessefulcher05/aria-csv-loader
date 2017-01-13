# Aria CSV Loader
This application takes a CSV file and submits it to Aria Systems via API

The header of the CSV must match the API input parameters of a given API

## Setup
Create a file named .env in the root directory and populate it with the following (comments are optional):

```
CSV_FILENAME=my_file.csv # name of file which must reside in files/input/
API_NAME=create_usage_m # exact name of the api
API_TYPE=core # api types. core, admintools, object
ENV=SF # should be one of the following: SC, PROD, SF_CPH, PROD_CPH
CLIENT_NO=123456 # Aria client number
AUTH_KEY=12325desdsv3r232e # Auth key for the Aria client
THREADS=50 # Number of concurrent api requests made to Aria
PRINT_OUTPUT_COUNT=100   # Determines how often a status message will be printed to the console 
```

Place an input CSV in files/input and ensure the filename matches the name in .env

## Running Application
* Ensure all .env parameters are configured correctly - read more about (dotenv)[https://github.com/motdotla/dotenv]
* Ensure (nodejs)[https://nodejs.org/en/] is installed and can be access from the command line using `node --version`
* from the command line, open the directory and type `npm install` to install all dependencies. This application will not run unless this step is completed.

### Visual Studio (Recommended for users not familiar with NodeJS)
* Download (Visual Studio Code)[https://code.visualstudio.com/]
* Open project folder
* Ensure that .vscode/launch.json exists. If not, when you attmpt to run just accept the defaults and ensure it is pointig to app.js (example below)
* Press F5 to run the application
* **Note:** you can place breakpoints to pause at any step along the way and look at the data

### Command Line
* Run the applciation with `node app.js` or `npm start`



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
