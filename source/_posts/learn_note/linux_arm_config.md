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
$ openocd -v
Open On-Chip Debugger 0.10.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
$ lsusb
Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 003 Device 002: ID 2717:5009 Xiaomi Inc. Mi Gaming Mouse
Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 005: ID 040b:0a67 Weltrend Semiconductor Weltrend USB Mouse
Bus 001 Device 004: ID 05e3:0610 Genesys Logic, Inc. 4-port hub
Bus 001 Device 003: ID 0b05:1939 ASUSTek Computer, Inc. AURA LED Controller
Bus 001 Device 002: ID 8087:0029 Intel Corp. 
Bus 001 Device 007: ID 0483:374b STMicroelectronics ST-LINK/V2.1  # <== 这个是我的开发板
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

# 生成工程代码
&emsp;&emsp;作为演示，这里就生成一个点亮板子LED灯的代码吧。

## 创建项目
1. 首先，打开STM32CubeMX，新建一个project。
![](/images/learn_note/linux_arm_config/fig_1.png)

2. 然后选择对应的芯片型号，我这块板子用的是`STM32F407VGT6`这块MCU，所以选这个：
![](/images/learn_note/linux_arm_config/fig_2.png)

## 配置项目
1. 打开调试功能：
打开System Core->SYS，Debug模式选择Serial Wire，也就是SWD。
![](/images/learn_note/linux_arm_config/fig_3.png)

2. 配置GPIO：
去官网上查[这块开发板的CAD文档](https://www.st.com/resource/en/schematic_pack/mb997-f407vgt6-c01_schematic.pdf)，在最后一页右下角找到了LED的部分，发现绿色的灯连的是PD12引脚，黄色的灯是PD13，红色的是PD14，蓝色的是PD15，这里我就试一下蓝色和红色的灯吧，那接下来配置PD14和PD15这两个引脚就好了。
![](/images/learn_note/linux_arm_config/fig_4.png)回到STM32CubeMX里，在芯片图右边找到这两个引脚，鼠标单击，两个引脚都配置成`GPIO_Output`模式。
![](/images/learn_note/linux_arm_config/fig_5.png)然后点击左边的System Core->GPIO就可以看到这两个引脚的配置选项了，接下来把这两个引脚配置成输出高电平(High)，使用推挽输出(Pull-up)方式（不记得这个推挽输出是啥意思了），如下图：
![](/images/learn_note/linux_arm_config/fig_6.png)

到这里项目就配置好了，接下来是生成代码。

## 生成代码
&emsp;&emsp;进入Project Manager，填写项目名字和保存路径，选择使用Makefile管理项目，然后点右上角的GENERATE CODE生成代码。
![](/images/learn_note/linux_arm_config/fig_7.png)

&emsp;&emsp;如果是第一次生成代码，会弹出一个框，意思大概是要先下载一个F4的包才能生成代码，这个包默认是下载到home目录下的STM32Cube里，因为文件夹开头是不带"."隐藏的，对于我这个强迫症来说，受不了home目录下有莫名其妙的文件夹。幸好在Help->Updater Setting有个Repository Folder，可以指定包的保存路径（设置前要先点File保存关闭项目才能设置），把路径改成了CubeMX的安装路径，然后把home目录下的STM32Cube删除，舒服了(๑¯∀¯๑)！
