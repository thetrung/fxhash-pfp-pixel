#!/bin/bash
echo "Generating profile picture token, please wait!"
npm i --silent >/dev/null
npm run build --silent >/dev/null
echo ""
echo "Your profile picture token was generated, find it in $(pwd)/dist-zipped/project.zip"
echo "Use this file to generate your token on fxhash!"
