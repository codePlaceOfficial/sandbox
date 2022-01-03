# sandbox
> Sandbox can compile and run the code in Docker and return the results in JSON format

## quick start
+ clone this repository
+ cd ./docker && sudo sh ./install.sh
+ cd .. && yarn && node test.js

## example

_Compile the NodeJS code_
``` javascript
const sandbox = require("./index");
sandbox.runJs(`console.log("hello,world")`)
```
