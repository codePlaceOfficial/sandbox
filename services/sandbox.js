var Docker = require('dockerode');
var stream = require('stream');
var docker = new Docker();
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require('uuid');
const cryptoRandomString = require("crypto-random-string");

// 删除文件夹及其下所有文件
function deleteDir(path) {
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

class __snadbox {
    // 通过Docker的Container实例构建
    constructor(contianer) {
        this.container = contianer;
    }

    /**
     * 运行CMD命令，并获得返回结果
     * @param container
     */
    runExec(Cmd, workingDir = null) {
        return new Promise((resolve, reject) => {

            var options = {
                Cmd,
                AttachStdout: true,
                AttachStderr: true
            };

            if (workingDir) options.WorkingDir = workingDir;

            this.container.exec(options, (err, exec) => {
                var infoStream = new stream.PassThrough();
                let info = "";
                infoStream.on("data", chunk => {
                    info += chunk.toString('utf8')
                })
                if (err) reject(err);
                exec.start((err, stream) => {
                    if (err) reject(err);
                    this.container.modem.demuxStream(stream, infoStream, infoStream);
                    stream.on("end", () => {
                        // info = info.trim();
                        resolve(info);
                    })

                });
            });
        })
    }

    /**
     * 获得CMD stream 流
     */
    getCmdStream() {
        return new Promise((resolve, reject) => {
            let opt = {
                'AttachStdout': true,
                'AttachStderr': true,
                'AttachStdin': true,
                'Tty': true,
                workingDir: "/",
                Cmd: ['/bin/sh'],
            };
            this.container.exec(opt, (err, exec) => {
                let options = {
                    'Tty': true,
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true,
                    // fix vim
                    hijack: true,
                };

                // container.wait((err, data) => {
                //     socket.emit('end', 'ended');
                // });

                if (err) {
                    console(err);
                    return;
                }

                exec.start(options, (err, stream) => {
                    resolve(stream);
                    // const dimensions = { h, w };
                    // if (dimensions.h != 0 && dimensions.w != 0) {
                    //     exec.resize(dimensions, () => {});
                    // }

                    // 得到结果
                    // stream.on('data', (chunk) => {
                    // });
                    // 输入命令
                    // stream.write("ls \n");
                });
            });
        })
    }

    kill() {
        this.container.stop();
    }
}

// 容器管理者
class SandboxManager {
    constructor(limit, workPath) {
        this.limit = limit; // 容器上限
        this.count = 0; // 已存在的容器数量
        this.sandboxs = {}
        this.workPath = workPath || `${path.join(__dirname, "../")}code/`
    }

    // 创建容器
    createSandbox() {
        this.count++;
        return new Promise((resolve, reject) => {
            if (this.count <= this.limit) {
                let dirName = cryptoRandomString({ length: 14 });

                // let sbWorkPath = path.join(this.workPath, dirName)

                // temp
                let sbWorkPath = path.join(`${path.join(__dirname, "../")}code/`, "test")

                // temp
                // fs.mkdir(sbWorkPath, (err) => {
                //     if (err) reject("IO系统出错")
                //     this.__createNewSandbox().then(sandbox => {
                //         let id = uuid()
                //         this.sandboxs[id] = {
                //             container:sandbox,
                //             sbWorkPath
                //         }; // sandbox 索引记录
                //         this.count++;
                //         resolve({
                //             id,
                //             container:sandbox
                //         })
                //     }).catch(() => { reject("创建失败"); this.count-- })
                // })
                this.__createNewSandbox(sbWorkPath).then(sandbox => {
                    let id = uuid()
                    this.sandboxs[id] = {
                        container: sandbox,
                        sbWorkPath
                    }; // sandbox 索引记录
                    this.count++;
                    resolve({
                        id,
                        container: sandbox,
                        workPath:sbWorkPath
                    })
                }).catch(() => { reject("创建失败"); this.count-- })
            } else {
                reject("容器数量达到上限")
            }
        })
    }

    // 根据id的到容器
    getSandbox(id) {
        return this.sandboxs[id];
    }

    // 删除容器
    deleteSandbox(id) {
        let sandbox = this.getSandbox(id);
        if (sandbox) {
            // console.log(sandbox)
            sandbox.container.kill()
            // temp
            // deleteDir(sandbox.sbWorkPath)
            this.count--;
            console.log(this.count);
        }
    }

    // 创建一个可以使用的容器
    __createNewSandbox(workDirPath) {
        this.now += 1;
        const sandboxImage = "codeplaceofficial/compiler:0.1";
        return new Promise((resolve, reject) => {
            const opt = {
                Image: sandboxImage,
                Tty: true,
                Cmd: ["/bin/bash"],
                WorkingDir: "/usr/src/app",
                // AutoRemove: true,
                HostConfig: {
                    AutoRemove: true,
                    Binds: workDirPath ? [
                        `${workDirPath}:/usr/src/app`
                    ] : []
                }
            }

            docker.createContainer(opt, function (err, container) {
                container.start({}, async function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(new __snadbox(container));
                });
            })
        })
    }
}
module.exports.SandboxManager = SandboxManager;