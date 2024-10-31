#!/bin/bash
npm run start  # running locally memorizes ids of issues so we auto push to git
git add data/fetchedissues.json 
git commit -m "Update fetched issues"  # commit updated fetched issues
