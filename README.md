# PRINT API based on Google Chrome

This repository provides a simple api wrapper for puppeteer (the nodejs way to interact with google chrome headless). It also provides some functions to include it into a given application landscape (like creating the pdf and sending it back to a given endpoint of choice).

The [CHANGLOG](CHANGLOG.md) gives you information  

## Installation

Install all the requirements for the application.

```bash
npm i
```

Define the required environment keys:

```
JWT_SECRET=2VRxS0s15nV2BnyVYcgBvKJwoaPeQdVXsaJylt96Jb9iypXOGylcTCTo8rS1E7Mk
JWT_ISSUER=http://localhost:8000/api/auth/login
APP_KEY=
PORT=3000
PERMISSION_BROWSE=print
```

## Run the service

```bash
npm run start 
```

## Configuration

Currently there are 3 ways of using this application:
- with JWT
- with Basic Auth
- without any authentication

Please be aware that we do not recommend the last implementations for server available from within the internet.

### JSON Web Token Solution

If you want to use the JWT Authentication the JWT must contain custom claims with:
- roles (Array)
- permissions (Array)

If the claim contains a "*" or the given *PERMISSIONS_PRINT* key it will proceed.

#### JWT_ACTIVE (env key)

Default: true
This will be the default setting. Set this to false if you do not want to use JWT at all.

#### JWT_SECRET (env key)

Provide a valid JWT Secret for the application. This application will not check if the user exists if the key is valid.

#### JWT_ISSUER (env key)

An addtional security check is the check of the given issuer. Please provide a valid url for the check -> otherwise the API will return a 403.

### Basic Authentication

#### BASIC_ACTIVE
Default: true
Please be aware that this setup will only be effective if you have set *JWT_ACTIVE* to false

#### BASIC_USER
Default: null
You will need to set this to an appropiate name

#### BASIC_SECRET
Default: null
Define a password in clear text.

### Other environment keys 

#### APP_KEY (env key)

The *APP_KEY* will be required if you do not provide a valid *postBackUrl* in the request body. In those cases the application will return you a signed download url.

#### PORT (env key)

The port is required if you want to start the application on a differnt port.

## Endpoints
### [POST] /api/browse

```json
{
    "url": "http://orf.at",
    "filename": "my-wished-filename",
    "postBackWait": true,
    "postBackUrl": "http://where-should-it-be-posted",
    "postBackBody": "{}",
    "token": "CUSTOM AUTH-TOKEN"
}
```

#### url

Provide the url of the page you want to be tranformed to a pdf document.

#### filename

If you do not provide a filename (without the extension) a uuid will be used as filename. Please choose a unique string otherwise you potentially overwrite documents (name conflicts).

#### postBackUrl

If you provide a postBackUrl the api will try to post the document to the given url.

#### postBackBody

Provide a string of data you wanna send back to the url. Please be aware that only string (NOT json) is supported.

#### postBackWait
Default: true

Provide a boolean value if you want to wait for the complete answer of the postBackProcess.

If set to false the return value "uploaded" will always be false. 

### [GET] /api/browse/:id

This endpoint will return the file. Please be aware that there will be a query string required query string param *signed*.

eg. http://localhost:3000/api/browse/199f0e09-516c-4f40-9960-7aa6f89d8c02?signed=r:1876707481;225240c533184a5f4fdd5aa29aea7e70

Without this query string param the request will fail and you will get an 403.

## Docker
This repository provides a docker image and a docker-compose file as an example.

```yml
version: "3.1"
services:
  app: 
    image: ambersive/print-api:latest
    environment: 
       - JWT_ACTIVE:false
       - BASIC_ACTIVE:true
       - BASIC_USER:test
       - BASIC_SECRET:test
    restart:  always
    ports:
    - "9005:3000"
```

## Security Vulnerabilities

If you discover a security vulnerability within this application, please send an e-mail to Manuel Pirker-Ihl via [manuel.pirker-ihl@ambersive.com](mailto:manuel.pirker-ihl@ambersive.com). All security vulnerabilities will be promptly addressed.

## TODOS
- Provide tests for the endpoints