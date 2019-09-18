```
#配置kubernetes.repo的源，由于官方源国内无法访问，这里使用阿里云yum源
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

#在所有节点上安装指定版本 kubelet、kubeadm 和 kubectl
yum install -y kubelet-1.13.1 kubeadm-1.13.1 kubectl-1.13.1

#启动kubelet服务
systemctl enable kubelet && systemctl start kubelet
```
