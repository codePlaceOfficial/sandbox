# sandbox
> Sandbox can compile and run the code in Docker and return the results in JSON format

## quick start
+ clone this repository
+ cd ./docker && sudo sh ./install.sh
+ cd .. && yarn && cd ./test && node index.js

## example
_Compile the NodeJS code_
``` javascript
const sandbox = require("./index");
sandbox.runJs(`console.log("hello,world")`)
```
