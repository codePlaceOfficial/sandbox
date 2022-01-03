const sandbox = require("./index");

// 测试getCouldUserContainer
// setTimeout(() => {
//     sandbox.runJs(`
//         console.log("hello. I am 2")
//     `).then(res => {
//             console.log(res)
//         })
// }, 5000);

// const server = require("./services/index");
// 压力测试
for (let i = 0; i <= 15; i++) {
    sandbox.runJs(`
    console.log("hello. I am ${i}")
`).then(res => {
        console.log(res)
    })
}

/**
 * 代码类型测试
 */
// sandbox.runC(`
// #include <stdio.h>
// int main()
// {
//     printf("Hello, World!");
//     return 0;
// }
// `).then(console.log)

// sandbox.runJava(`
// public class HelloWorld
// {
//     public static void main(String[] args)
//         { 
//       System.out.println( "Hello, World!" );
//     }
// }
// `).then(console.log)

// sandbox.runJs(`console.log(hello world)`).then(console.log)

// sandbox.runPython3(`print("Hello, World!")`).then(console.log)
// sandbox.runPython2(`print "Hello, World!" `).then(console.log)

// server.init().then(() => {
// sandbox.runJs(`
//     console.log("123")
// `).then(res => {
//     console.log(res)
// })

// sandbox.runJs(`
//     console.log("1234")
// `).then(res => {
//     console.log(res)
// })
// });

// setTimeout(() => {
//     console.log("start");
//     sandbox.runJs(`
//         console.log("1234")
//     `).then(res => {
//         console.log(res)
//     })
// }, 5000);