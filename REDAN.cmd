@echo off

set port=5050
set node_env=production
node --expose-gc app.js
