@echo off

set port=5050
node  --expose-gc --inspect app.js
