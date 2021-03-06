var Docker = require('dockerode');
var stream = require('stream');
var docker = new Docker();
const { v4: uuid } = require('uuid');



class __snadbox {
    // 通过Docker的Container实例构建
    constructor(contianer) {
        this.container = contianer;
    }

    /**
     * 运行CMD命令，并获得返回结果
     * @param container
     */
    runExec(Cmd, workingDir = "/usr/src/app") {
        return new Promise((resolve, reject) => {
            var options = {
                Cmd,
                AttachStdout: true,
                AttachStderr: true,
            };

            if (workingDir) options.WorkingDir = workingDir;
            this.container.exec(options, (err, exec) => {
                var infoStream = new stream.PassThrough();
                let info = "";
                infoStream.on("data", chunk => {
                    let str = chunk.toString('utf8');
                    info += str.substring(0,str.length-1)
                })
                if (err) reject(err);
                exec.start((err, stream) => {
                    if (err) reject(err);
                    this.container.modem.demuxStream(stream, infoStream, infoStream);
                    stream.on("end", () => {
                        resolve(info);
                    })
                });
            });
        })
    }

    /**
     * 获得CMD stream 流
     */
    getCmdStream(workPath = "/usr/src/app") {
        return new Promise((resolve, reject) => {
            let opt = {
                'AttachStdout': true,
                'AttachStderr': true,
                'AttachStdin': true,
                'Tty': true,
                workingDir: workPath,
                Cmd: ['/bin/zsh'],
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
    constructor(limit) {
        this.limit = limit; // 容器上限
        this.count = 0; // 已存在的容器数量
        this.sandboxs = {}
        // this.workSpace = workSpace || `${path.join(__dirname, "../")}code/`
    }

    // 创建容器
    createSandbox(workPath) {
        this.count++;
        return new Promise((resolve, reject) => {
            if (this.count <= this.limit) {
                let sbWorkPath = workPath;
                this.__createNewSandbox(sbWorkPath).then(sandbox => {
                    console.log(sbWorkPath);

                    let id = uuid()
                    this.sandboxs[id] = {
                        container: sandbox,
                        workPath: sbWorkPath
                    }; // sandbox 索引记录
                    this.count++;
                    resolve({
                        id,
                        container: sandbox,
                        workPath: sbWorkPath
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
            this.count--;
            // console.log(this.count);
        }
    }

    // 创建一个可以使用的容器
    __createNewSandbox(workDirPath) {
        this.now += 1;
        const sandboxImage = "codeplaceofficial/compiler:0.2";
        return new Promise((resolve, reject) => {
            const opt = {
                Image: sandboxImage,
                Tty: true,
                Cmd: ["/bin/zsh"],
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