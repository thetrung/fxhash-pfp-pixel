@echo off
echo Generating profile picture token, please wait!
call npm i --silent > NUL
call npm run build --silent > NUL
echo:
echo Your profile picture token was generated, find it in %cd%\dist-zipped\project.zip
echo Use this file to generate your token on fxhash!
