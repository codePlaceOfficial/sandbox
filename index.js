const serve = require("./services");
const runCode = serve.runCode;


module.exports.runJs = (code) => {
    return runCode(code, "nodejs", "index.js", [["node", "index.js"]]);
}

module.exports.runJava = (code) => {
    return runCode(code, "java", "Main.java", [["javac", "Main.java"], ["java", "Main"]]);
}

module.exports.runC = (code) => {
    return runCode(code, "c", "main.c", [["gcc", "-o", "main", "main.c"], ["./main"]]);
}

module.exports.runPython3 = (code) => {
    return runCode(code, "python3", "main.py", [["python", "./main.py"]]);
}

module.exports.runPython2 = (code) => {
    return runCode(code, "python2", "main.py", [["python", "./main.py"]]);
}