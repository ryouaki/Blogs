# 规范

为什么要有规范，就是没有规矩不宜成方圆，规矩就是为了避免问题而设立的。

## 规范
1. 由开发leader创建需求开发分支，名称规则：feat-【需求id】
2. 开发者以leader创建的开发分支建立自己的作业分支，命名规则：feat-【需求id】-开发者名
3. 开发者从自己开发分支创建merge-request到开发分支
4. 每天开发leader针对merge-request进行code review，
5. 开发者开发完成并按code review修改后，重新提交
6. 开发leader确认代码无误后进行合并
7. 提交测试进行测试分支tag创建，名称规则：feat-【需求id】-【提测日期】
8. 针对bug进行修改，分支建立：fix-【需求id】-【问题票id】
9. 开发人员提交bug修复代码，创建merge-request到开发分支，开发leader进行code review
10.开发leader将fix分支合并
11.测试打tag进行发布
