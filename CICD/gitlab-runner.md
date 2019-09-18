```sh
  # curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash
  
  # sudo yum install gitlab-runner
  
  // 注册runner，注意每一个项目都要注册自己的runner。pipelines是根据tag去查找runner的。
  # gitlab-runner register
```
