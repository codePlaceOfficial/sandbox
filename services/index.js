var Docker = require('dockerode');
var stream = require('stream');
var docker = new Docker();
const fs = require("fs");
const path = require("path");
const cryptoRandomString = require("crypto-random-string");

const codePath = `${path.join(__dirname, "../")}/code/`
// 创建文件
function createCodeFile(code, fileName) {
    let dirname = cryptoRandomString({ length: 12 });
    const dirPath = `${path.join(__dirname, "../")}/code/${dirname}`;
    const filePath = `${dirPath}/${fileName}`;

    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, { recursive: true }, err => {
            if (!err) {
                fs.writeFile(`${filePath}`, code, function (err) {
                    if (err) {
                        reject();
                        return;
                    }
                    resolve({ filePath: dirPath, dirname })
                });
            }
        })
    })
}

// 删除文件
function deleteFile(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFile(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

/**
 * 运行CMD命令，并获得返回结果
 * @param container
 */
function runExec(container, Cmd, workingDir = null) {
    return new Promise((resolve, reject) => {
        var options = {
            Cmd,
            AttachStdout: true,
            AttachStderr: true
        };

        if (workingDir) options.WorkingDir = workingDir;

        container.exec(options, function (err, exec) {
            var infoStream = new stream.PassThrough();
            let info = "";
            infoStream.on("data", chunk => {
                info += chunk.toString('utf8')
            })

            if (err) reject(err);
            exec.start(function (err, stream) {
                if (err) reject(err);
                container.modem.demuxStream(stream, infoStream, infoStream);
                stream.on("end", () => {
                    // info = info.trim();
                    resolve(info, container);
                })

            });
        });
    })
}

class Runners {
    // 队列存储需要新容器的请求
    constructor(total) {
        this.now = 0; // 预计的容器数量(包括开始创建但是没有创建完的)
        this.total = total;
        this.runners = [];
        this.customers = []; // 存储需要容器的请求

        this.addNewRunner(); // 初始化一下
    }

    // 得到一个容器
    getRunner() {
        return new Promise((resolve, reject) => {
            let container = this.getCouldUseRunner(true);
            if (container == null) {
                // 没有可用容器
                this.customers.push(resolve);
            }else{
                this.now -= 1;
                resolve(container);
            }
            
            this.addNewRunner();
        })
    }

    // 添加一个容器
    addRunner(index, container) {
        this.runners[index] = { container, couldUse: true };
    }

    // 找到一个无法使用的容器下标
    getDisabledRunner() {
        if (this.runners.length < total) return this.runners.length;
        for (let index in this.runners) {
            if (this.runners[index].couldUse == false) return index;
        }
        return -1; // 所有容器都可使用
    }

    // 找到一个可以使用的容器
    getCouldUseRunner(useIt = false) {
        for (let index in this.runners) {
            if (this.runners[index].couldUse == true) {
                this.runners[index].couldUse = !useIt; // 如果useIt为true，及用户用这个runner的话，就把runner设为false
                // console.log(this.runners[index].container);
                return this.runners[index].container;
            }
        }
        return null;
    }

    // 创建并添加一个新容器
    addNewRunner() {
        if (this.getDisabledRunner() == -1) { // 容器足够
            return;
        }
        if (this.now < this.total) {
            this.__createNewRunner().then(container => {
                let customer = this.customers.shift();
                if (customer) { // 有消费者
                    customer(container);
                    this.now -= 1;
                } else {
                    this.addRunner(this.getDisabledRunner(), container);
                }
                this.addNewRunner();
            })
        }
    }
    // 创建一个可以使用的容器
    __createNewRunner() {
        this.now += 1;
        const runnerImage = "codeplaceofficial/compiler:0.1";
        return new Promise((resolve, reject) => {
            const opt = {
                Image: runnerImage,
                Tty: true,
                Cmd: ["/bin/bash"],
                WorkingDir: "/usr/src/app",
                // AutoRemove: true,
                HostConfig: {
                    AutoRemove: true,
                    Binds: [
                        `${codePath}:/usr/src/app`
                    ]
                }
            }

            docker.createContainer(opt, function (err, container) {
                container.start({}, async function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(container);
                });
            })
        })
    }
}




const total = 5; // 容器池
let runners = new Runners(total);

/**
 * 进行初始化
 */
module.exports.runCode = (code, image, fileName, cmds) => {
    return new Promise((resolve, reject) => {
        createCodeFile(code, fileName).then(async ({ filePath, dirname }) => {
            runners.getRunner().then(async container => {
                for (let cmd of cmds) {
                    let data = await runExec(container, cmd, `/usr/src/app/${dirname}`);
                    if (data) {
                        deleteFile(filePath);
                        container.stop().then()
                        resolve(data);
                        return;
                    }
                }
            });

        });
    })
}
