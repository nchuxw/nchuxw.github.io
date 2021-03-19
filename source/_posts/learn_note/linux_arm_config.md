---
title: 'linuxmint搭建stm32开发环境'
date: 2021-03-16 21:00:00
categories: 学习笔记
tags: [嵌入式, arm, linux]
---

# 先说两句
&emsp;&emsp;最近公司要做一个单片机上的项目，虽然之前学过一点点，不过当时只会写“hello world”级别的代码。感觉这东西挺好玩的，趁着晚上下班没事学一下，随便记录一下开发环境的搭建过程。
&emsp;&emsp;开发板是`STM32F407G-DISC1`，大学搞飞控的时候买的，~~当时我在团队里面是划水的~~。之前是在win10系统开发，现在换了linuxmint系统，要重新学一下怎么搭环境，主要是参考大佬的 <https://blog.csdn.net/u010000843/article/details/114531922> 这篇博客搭的。用到的工具先列一下吧：

| 工具 | 介绍 |
| :--- | :----|
| vscodium | vscode完全开源版的IDE，和vscode很像 |
| STM32CubeMX | ST公司的代码自动生成工具 |
| gcc-arm-none-eabi | arm平台的GNU编译器 |
| openOCD | 开源的烧录调试工具 |

&emsp;&emsp;好的，接下来就开始吧。

# 开发工具安装
## vscodium
&emsp;&emsp;去GitHub上下载，地址：<https://github.com/vscodium/vscodium/releases>。建议不要装1.5x.x版本的，代码提示经常加载不出来，vscode也是一样。

## STM32CubeMX
&emsp;&emsp;ST官网上下载安装就好了，[传送门](https://www.st.com/zh/development-tools/stm32cubemx.html)。

## gcc-arm-none-eabi
&emsp;&emsp;这个在arm官网上有，[传送门](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)，下载后解压到你喜欢的某个路径下，然后把里面的`bin`目录添加到`PATH`环境变量里。方法如下：
```shell
$ vi ~/.bashrc

# 打开.bashrc后把下面这两句添加到里面
GCC_ARM_NONE_EABI_HOME="" # 这里写gcc-arm-none-eabi解压后的路径
export PATH="${GCC_ARM_NONE_EABI_HOME}/bin:$PATH"

# 保存退出后让PATH生效
$ source ~/.bashrc
```
一切顺利的话，可以查到编译器的版本号。
```shell
$ arm-none-eabi-gcc --version
arm-none-eabi-gcc (GNU Arm Embedded Toolchain 9-2020-q2-update) 9.3.1 20200408 (release)
Copyright (C) 2019 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

## openOCD
&emsp;&emsp;用apt安装：
```shell
$ sudo apt-get install openocd
```
成功安装完后可以看到openOCD版本号，电脑用USB线连接上开发板后，可以用`lsusb`命令可以看到相关信息。
```shell
# 这里要更新
```

# 生成工程代码
&emsp;&emsp;作为演示，这里就生成一个点亮板子LED灯的代码吧。
1. 首先，打开STM32CubeMX，新建一个project。
![]("fig_1.png")

2. 然后选择对应的芯片型号，我这块板子用的是`STM32F407VGT6`这块MPU，所以选这个：
![]("fig_2.png")

3. 配置项目：
打开调试功能，打开System Core->SYS，Debug模式选择Serial Wire，也就是SWD。
![]("fig_3.png")
