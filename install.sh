#!/bin/sh

#############################
#安装docker
#############################
if ! type docker >/dev/null 2>&1; then # 未安装docker

curl -sSL https://get.daocloud.io/docker | sh #安装docker

################## 配置国内镜像加速 #####################
sudo -S mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn/"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

################### 配置用户组 ##########################
sudo groupadd docker #添加docker用户组
sudo gpasswd -a $USER docker #将登陆用户加入到docker用户组中
newgrp docker #更新用户组

echo "docker安装成功"

fi

# for file in $(ls) # 遍历文件夹
# do
# if [ -d $file ]; then # 如果为文件夹
# docker build -t $file ./$file # 安装dockerFile
# echo ${file} 环境安装成功
# fi
# done

docker pull codeplaceofficial/compiler:0.1 # 安装dockerFile

