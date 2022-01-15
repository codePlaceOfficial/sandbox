const {SandboxManager} = require("../services/sandbox")
const sandboxManager = new SandboxManager(3);
sandboxManager.createSandbox().then(sandbox => {
    sandboxManager.deleteSandbox(sandbox.id);
}).catch(console.log)


