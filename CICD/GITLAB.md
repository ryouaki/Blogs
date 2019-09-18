```sh
 # yum update;
 
 // 安装依赖
 # sudo yum install -y curl policycoreutils-python openssh-server
 // 开启sshd
 # sudo systemctl enable sshd
 # sudo systemctl start sshd
 // 添加http，https服务允许通过防火墙
 # sudo firewall-cmd --permanent --add-service=http
 # sudo firewall-cmd --permanent --add-service=https
 // 重新启动防火墙
 # sudo systemctl reload firewalld
 
 // 邮件服务
 # sudo yum install postfix
 # sudo systemctl enable postfix
 # sudo systemctl start postfix

 // 配置gitlab依赖源
 # curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash

 # sudo EXTERNAL_URL="https://gitlab.example.com" yum install -y gitlab-ce

```
