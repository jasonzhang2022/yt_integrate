# Introduction 

Basic flow to demonstrate how app cloud use YT V3 Data API


# Step
1. install nvm and node (you can follow Gemini instruction)
1. Create a Cloud project
   1. Enable 'YouTube v3 Data API'
   1. Create an OAuth client ID
      1. Authorized Javascript origin: http://localhost:5173
      1. Authorized redirect URIs: http://localhost:5173/auth/google/callback. 
      1. Write down client id and client secret
   1. Config OAuth conent screen-> Audience
      1. Publishing status:test
      1. Add a new Test User you will use for testing
1. Clone this repo
1. Create  a local .env which has two variables.

```
CLIENT_ID=the value above 
CLIENT_SECRET= the value above
```
1. npm install
2. npm run dev

