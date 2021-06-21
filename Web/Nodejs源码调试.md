- 下载源码
- ./configure --debug
- make -C out  BUILDTYPE=Debug -j4
- VSC添加c/c++插件
- ```js
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
      {
          "name": "(lldb) Launch",
          "type": "cppdbg",
          "request": "launch",
          "program": "${workspaceFolder}/out/Debug/Node",
          "stopAtEntry": false,
          "cwd": "${workspaceFolder}",
          "environment": [],
          "externalConsole": true,
          "MIMode": "lldb"
      }
  ]
}
```
- 设置断点。
