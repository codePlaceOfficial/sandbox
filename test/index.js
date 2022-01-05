const sandbox = require("../../index");
// 压力测试
for (let i = 0; i <= 15; i++) {
    sandbox.runJs(`
    console.log("hello. I am ${i}")
`).then(res => {
        console.log(res)
    })
}


// 测试getCouldUserContainer
// setTimeout(() => {
//     sandbox.runJs(`
//         console.log("hello. I am 2")
//     `).then(res => {
//             console.log(res)
//         })
// }, 5000);

