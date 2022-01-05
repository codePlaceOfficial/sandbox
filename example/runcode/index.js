const sandbox = require("../../index");

/**
 * RunCode example
 */
sandbox.runC(`
#include <stdio.h>
int main()
{
    printf("Hello, World!");
    return 0;
}
`).then(console.log);

sandbox.runJava(`
public class Main
{
    public static void main(String[] args)
        { 
      System.out.println( "Hello, World!" );
    }
}
`).then(console.log);

sandbox.runJs(`console.log("hello world!")`).then(console.log);
sandbox.runPython3(`print("Hello, World!")`).then(console.log);
sandbox.runPython2(`print "Hello, World!" `).then(console.log);