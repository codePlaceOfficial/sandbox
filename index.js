const serve = require("./services/sandbox");
const runCode = serve.runCode;


module.exports.runJs = (code) => {
    return runCode(code, "index.js", [["node", "index.js"]]);
}

module.exports.runJava = (code) => {
    return runCode(code, "Main.java", [["javac", "Main.java"], ["java", "Main"]]);
}

module.exports.runC = (code) => {
    return runCode(code,"main.c", [["gcc", "-o", "main", "main.c"], ["./main"]]);
}

module.exports.runPython3 = (code) => {
    return runCode(code, "main.py", [["python3", "./main.py"]]);
}

module.exports.runPython2 = (code) => {
    return runCode(code, "main.py", [["python2", "./main.py"]]);
}

module.exports.getSandbox = serve.getSandbox