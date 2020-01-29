@echo off

set port=5050
node  --expose-gc --inspect=0.0.0.0:6000 app.js
