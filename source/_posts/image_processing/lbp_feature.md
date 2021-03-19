---
title: '图像LBP特征的提取'
date: 2021-03-18
categories: "图像处理"
tags: ["图像处理", "LBP", "特征提取"]
mathjax: true
---

本文内容大部分~~抄袭~~引用自大佬的[一篇博客](https://www.cnblogs.com/urglyfish/p/12424087.html)。

# 背景
&emsp;&emsp;LBP（Local Binary Pattern，局部二值模式）是一种用来描述图像局部纹理特征的算子，具有旋转不变形和灰度值不变形等显著优点。主要用于纹理特征提取，在人脸识别部分有较好的效果。

# 概述
&emsp;&emsp;从94年T. Ojala, M.Pietikäinen, 和D. Harwood提出至今，LBP大致经历了三个版本。下面按照时间顺序进行介绍。

# 原始的LBP
&emsp;&emsp;最初的LBP算子通过定义一个3x3的窗口，以窗口内中心点的像素值为标准，对比窗口内另8个点像素值的大小，大于为1，小于为0。8个点形成一个二进制数字（通常转换为十进制表示）即为中心点的LBP特征值。详细计算如下图：

![](/images/image_processing/lbp_feature/fig_1.png)

通过上面得到的LBP算子具有很多缺点，之后研究人员在LBP基础上进行不断改进。

```cpp
/**
 ************************************
 * @author   : stxw
 * @date     : 2021-03-18
 ************************************
 * @brief :
 * 		提取图像的原始LBP特征
 */

#include <stdio.h>

#include <opencv2/core.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>

void origin_LBP_feature(cv::InputArray src, cv::OutputArray dst);

int main(int argc, char *argv[])
{
	cv::Mat src_img, dst;

	src_img = cv::imread("img/img1.png", cv::IMREAD_GRAYSCALE);
	cv::imshow("原图", src_img);

	origin_LBP_feature(src_img, dst);
	cv::imshow("原始LBP特征", dst);

	cv::waitKey();
	return 0;
}

/**
 * @brief : 提取图像的原始LBP特征
 * @param src : 输入的图像
 * @param dst : 图像src的原始LBP特征
 * @return : None
 */
void origin_LBP_feature(cv::InputArray src, cv::OutputArray dst)
{
	cv::Mat _src, _dst, border_src;
	int i, j;

	/* 填充图像的边界 */
	_src = src.getMat();
	cv::copyMakeBorder(_src, border_src, 1, 1, 1, 1, cv::BORDER_CONSTANT, cv::Scalar(0));
	dst.create(_src.rows, _src.cols, _src.type());
	_dst = dst.getMat();

	/* 循环处理每个像素 */
	for(i = 0; i < dst.rows(); i++)
	{
		for(j = 0; j < src.cols(); j++)
		{
			uchar center = border_src.at<uchar>(i + 1, j + 1);
			uchar lbp_code = 0;
			lbp_code |= ((border_src.at<uchar>(i + 0, j + 0) > center) << 7);
			lbp_code |= ((border_src.at<uchar>(i + 0, j + 1) > center) << 6);
			lbp_code |= ((border_src.at<uchar>(i + 0, j + 2) > center) << 5);
			lbp_code |= ((border_src.at<uchar>(i + 1, j + 2) > center) << 4);
			lbp_code |= ((border_src.at<uchar>(i + 2, j + 2) > center) << 3);
			lbp_code |= ((border_src.at<uchar>(i + 2, j + 1) > center) << 2);
			lbp_code |= ((border_src.at<uchar>(i + 2, j + 0) > center) << 1);
			lbp_code |= ((border_src.at<uchar>(i + 1, j + 0) > center) << 0);
			_dst.at<uchar>(i, j) = lbp_code;
		}
	}
}
```

# 改进的LBP
&emsp;&emsp;原始LBP算子计算区域为像素点的周围8个点，在图像尺寸发生改变时会出现很大的偏差，不能正确反映像素点周围的纹理信息。为适应不同尺寸纹理特征，LBP原作者将圆形邻域代替正方形邻域。同时增加了旋转不变的特性，在对LBP特征值的存储部分，也进行了改进。详细如下文。

## 圆形LBP特征
&emsp;&emsp;圆形LBP特征以像素点为圆心，$R$为半径，提取半径上$P$个采样点，根据 [原始的LBP](#原始的LBP) 中像素值比较方法，进行像素值大小的比较，得到该点的LBP特征值。其中提取采样点的方法如下：
$$
x_t = x_d + R\cos(\frac{2\pi p}{P}) \\\\
y_t = y_d + R\cos(\frac{2\pi p}{P})
$$

&emsp;&emsp;$(x_t, y_t)$为某个采样点，$(x_d, y_d)$为邻域中心点，$p$为第p个采样点，$P$为采样点的个数。得到采样点的坐标可能为小数，改进后的LBP采用双线性插值法进行计算该点的像素值，计算公式如下：
$$
f(x, y) \approx \left[\begin{matrix}
	1 - (x - \lfloor x \rfloor) & x - \lfloor x \rfloor
\end{matrix} \right] \left[\begin{matrix}
	f(\lfloor x \rfloor, \lfloor y \rfloor) & f(\lfloor x \rfloor, \lfloor y \rfloor + 1) \\\\
	f(\lfloor x \rfloor + 1, \lfloor y \rfloor) & f(\lfloor x \rfloor + 1, \lfloor y \rfloor + 1)
\end{matrix} \right] \left[\begin{matrix}
	1 - (y - \lfloor y \rfloor) \\\\
	y - \lfloor y \rfloor
\end{matrix} \right]
$$

几种不同半径不同采样点数量的LBP算子：
![](/images/image_processing/lbp_feature/fig_2.png)

```cpp
/**
 * @brief : 提取图像的圆形LBP特征
 * @param src : 输入的图像
 * @param dst : 图像src的圆形LBP特征
 * @return : None
 */
void circular_LBP_feature(cv::InputArray src, cv::OutputArray dst, int num_neighbor, double radius)
{
	cv::Mat _src, _dst, border_src;
	int i, j, k, padding;
	double x, y, neighbor;

	_src = src.getMat();
	dst.create(_src.rows, _src.cols, _src.type());
	_dst = dst.getMat();
	/* 填充图像的边界 */
	padding = (int)radius + 1;
	cv::copyMakeBorder(_src, border_src, 
		padding, padding, padding, padding, cv::BORDER_CONSTANT, cv::Scalar(0));

	/* 循环处理每个像素 */
	for(i = 0; i < dst.rows(); i++)
	{
		for(j = 0; j < src.cols(); j++)
		{
			uchar center = border_src.at<uchar>(i + padding, j + padding);
			uchar lbp_code = 0;
			for(k = 0; k < num_neighbor; k++)
			{
				/* 根据公式计算第k个采样点的坐标，这个地方可以优化，不必每次都进行计算radius*cos，radius*sin */
				x = (double)j + radius * cos(2.0 * CV_PI * k / num_neighbor);
				y = (double)i + radius * sin(2.0 * CV_PI * k / num_neighbor);
				neighbor = bilinear_interpolation(src, x, y);
				lbp_code |= ((neighbor > center) << (num_neighbor - k - 1));
			}
			_dst.at<uchar>(i, j) = lbp_code;
		}
	}
}

/**
 * @brief : 利用双线性内插计算图像的浮点像素值
 * @param src : 需要插值的图像
 * @param x : x坐标
 * @param y : y坐标
 * @return : 图像src在浮点坐标(x, y)处的浮点像素值
 */
double bilinear_interpolation(cv::InputArray src, double x, double y)
{
	cv::Mat _src = src.getMat();
	if(x < 0 || x > _src.cols || y < 0 || y > _src.rows)
	{
		return 0;
	}

	/* 图像中与浮点像素最近的四个整数坐标值(lx:左x、rx:右x、uy:上y、dy:下y) */
	double lx = (int)x;
	double rx = lx + 1;
	double uy = (int)y;
	double dy = uy + 1;

	/* 先计算y方向的两个像素点值f1、f2，再计算xy两个方向上的像素点值 */
	double f1 = (rx - x) * _src.at<uchar>(uy, lx) + (x - lx) * _src.at<uchar>(uy, rx);
	double f2 = (rx - x) * _src.at<uchar>(dy, lx) + (x - lx) * _src.at<uchar>(dy, rx);
	double xy = (dy - y) * f1 + (y - uy) * f2;
	return xy;
}
```

## 旋转不变LBP特征
&emsp;&emsp;上面通过采取圆形邻域的计算，一定程度上削弱了尺度改变的影响。研究人员在上面的基础上进一步扩展，使具备旋转不变的特征。

&emsp;&emsp;首先，在确定半径大小和采样点数目后，不断旋转圆形邻域内采样点的位置，得到一系列的LBP特征值，从这些LBP特征值中选择最小的值作为LBP中心像素点的LBP特征值，具体如下图：
![](/images/image_processing/lbp_feature/fig_3.png)

&emsp;&emsp;通过不断旋转，取最小值，使具备旋转不变特性。

```cpp
/**
 * @brief : 对LBP特征图像进行旋转不变处理
 * @param src : 输入的LBP特征图像
 * @param dst : 进行旋转不变处理后的特征图像
 * @return : None
 */
void rotation_invariant(cv::InputArray src, cv::OutputArray dst, int num_neighbor)
{
	cv::Mat _src, _dst;
	int i, j, k;
	uchar current_value, min_value, temp;

	_src = src.getMat();
	dst.create(_src.rows, _src.cols, _src.type());
	_dst = dst.getMat();

	/* 循环处理每个像素 */
	for(i = 0; i < _src.rows; i++)
	{
		for(j = 0; j < _dst.cols; j++)
		{
			current_value = _src.at<uchar>(i, j);
			min_value = current_value;
			for(k = 1; k < num_neighbor; k++)
			{
				/* 循环右移k位 */
				temp = (current_value >> k) | (current_value << (num_neighbor - k));
				temp &= (0xff >> (8 - num_neighbor));
				if(temp < min_value)
				{
					min_value = temp;
				}
			}
			_dst.at<uchar>(i, j) = min_value;
		}
	}
}
```

## 统一模式LBP特征
&emsp;&emsp;统一模式LBP（Uniform Pattern LBP）特征也称为等价模式或均匀模式。对LBP特征值的存储方式上，进行了优化。详细如下。

&emsp;&emsp;假设对于半径为$R$的圆形邻域内提取$P$个采样点，会产生$2^P$种二进制表达方法，随着邻域内采样点数目的增加，二进制模式的种类以指数形式增加，不利于LBP特征值的存储、提取、分类和识别。LBP原作者提出一种“统一模式”对LBP算子进行降维。详细如下。

&emsp;&emsp;在实际图像中，绝大多数LBP模式只包括从0到1或从1到0的转变，LBP原作者将“统一模式”定义为当某个LBP特征值所对应的二进制数从0到1或从1到0的转变最多有两次时，该LBP所对应的二进制就称为一个统一模式。如`00000000`（0次跳变）、`00000011`（1次跳变）、`10001111`（2次跳变）均为统一模式类。除统一模式类外均归为混合模式类。上述算法，使得模式数量由原来的$2^P$种减少为$P(P - 1) + 2 + 1$种（$P$代表采样点的数量）。

实例介绍：

&emsp;&emsp;如采样点数为8，即256种LBP特征值，根据统一模式可分为59类：跳变0次——2个，跳变1次——0个，跳变2次——56个，...跳变8次——1个。（跳变1次为0个是因为LBP作者把LBP二进制数字看做一个圆性的序列，故跳变1次为0个）

```cpp
/**
 * @brief : 对LBP特征进行统一模式编码
 * @param src : 输入的LBP特征
 * @param dst : 用统一模式编码的LBP特征
 * @return : None
 */
void uniform_pattern(cv::InputArray src, cv::OutputArray dst, int num_neighbor)
{
	cv::Mat _src, _dst;
	int i, j, k, hop_time;
	uchar kind, curr_bit, next_bit;
	uchar table[256] = {0};

	/* 计算编码映射关系 */
	kind = 1; /* 用0来表示混合模式类，所以从1开始计算统一模式类 */
	for(i = 0; i < 256; i++)
	{
		/* 计算跳变次数 */
		hop_time = 0;
		for(j = 0; j < num_neighbor; j++)
		{
			/* 计算i的二进制第j位，以及j的下一位--第(j + 1) % num_neighbor位 */
			curr_bit = (i >> j) & 0x01;
			next_bit = (i >> ((j + 1) % num_neighbor)) & 0x01;
			if(curr_bit != next_bit)
			{
				hop_time++;
			}
		}
		/* 跳变次数小于等于2，说明是统一模式类 */
		if(hop_time <= 2)
		{
			table[i] = kind;
			kind++;
		}
	}

	_src = src.getMat();
	dst.create(_src.rows, _src.cols, _src.type());
	_dst = dst.getMat();
	/* 对输入的LBP特征进行统一模式编码 */
	for(i = 0; i < _src.rows; i++)
	{
		for(j = 0; j < _src.cols; j++)
		{
			_dst.at<uchar>(i, j) = table[_dst.at<uchar>(i, j)];
		}
	}
}
```
## MB-LBP特征
&emsp;&emsp;MB-LBP特征，全称为Multiscale Block LBP,由中科院的研究人员研究发表，原理与HOG特征提取有相似之处，介绍MB-LBP仅用于了解，下面是原理介绍。

&emsp;&emsp;首先将图像分为分为多个块，再将每个小块分成多个区域，每个区域的灰度值为该区域内灰度值的平均值。在一个块内，将中心区域的灰度值大小与周围区域的灰度值大小进行比较形成LBP特征值。如下图：
![](/images/image_processing/lbp_feature/fig_4.png)

&emsp;&emsp;作者对得到的MB-LBP特征值同样进行均值编码。首先，对得到的特征值采用直方图进行表示，计算每一种特征值的数量，进行排序，将排序在前63为的特征值看作是统一模式类，其他的为混合模式类，共64类。

# LBPH
&emsp;&emsp;LBP的最后一步改进为LBPH即LBP特征统计直方图的使用，可用于机器学习特征的提取。这种表示方法由Ahonen等人提出，将LBP特征图像分成m个局部块，提取每个局部块的直方图，并依次连接在一起形成LBP特征的统计直方图。具体过程如下：

1. 计算图像中每一像素点的LBP特征值。
2. 图像进行分成多块。（Opencv中默认将LBP特征图像分为8行8列64块区域。）
3. 计算每块区域的LBP特征值的直方图，并将直方图进行归一化。（横坐标为LBP特征值的表示方式，纵坐标为数量）
4. 将上面计算的每块区域特征图像的直方图按顺序依次排列成一行，形成LBP特征向量。
5. 用机器学习方法对LBP特征向量进行训练。

举例说明LBPH的维度：

&emsp;&emsp;采样点为8个，如果用的是原始的LBP或Extended LBP特征，其LBP特征值的模式为256种，则一幅图像的LBP特征向量维度为：$64 \times 256 = 16384$维， 而如果使用[统一模式LBP特征](#统一模式LBP特征)，其LBP值的模式为59种，其特征向量维度为：$64 \times 59 = 3776$维，可以看出，使用统一模式特征，其特征向量的维度大大减少， 这意味着使用机器学习方法进行学习的时间将大大减少，而性能上没有受到很大影响。

```cpp
/**
 * @brief : 提取图像的LBP特征统计直方图
 * @param src : 输入的图像
 * @param dst : 图像的LBP特征统计直方图，大小为(grid_w, grid_h, num_patterns)
 * @param num_patterns : LBP模式的种类
 * @param grid_w : 分块后的宽度，图像最终分成 grid_w×grid_h 个块
 * @param grid_h : 分块后的高度
 * @return : None
 */
void histogram_LBP_feature(cv::InputArray src, cv::OutputArray dst, int num_patterns, int grid_w, int grid_h)
{
	cv::Mat _src, _dst, block;
	int i, j;
	int weight, height;
	int dst_row_index;
	int32_t block_histogram[256];
	uchar *data, *dst_row_ptr;

	_src = src.getMat();
	dst.create(cv::Size(grid_w, grid_h), CV_32SC(num_patterns));
	_dst = dst.getMat();
	weight = (int)(_src.cols / grid_w);
	height = (int)(_src.rows / grid_h);

	dst_row_ptr = _dst.data;
	for(i = 0; i < grid_h; i++)
	{
		for(j = 0; j < grid_w; j++)
		{
			/* 对图像切块 */
			block = cv::Mat(_src, cv::Rect(j * weight, i * height, weight, height));
			/* 计算块的直方图 */
			memset(block_histogram, 0x00, sizeof(block_histogram));
			for(data = block.data; data != block.dataend; data++)
			{
				block_histogram[*data]++;
			}
			/* 将块的直方图存到dst的一行里 */
			memcpy(dst_row_ptr, block_histogram, 4 * num_patterns);
			/* dst_row_ptr指向dst的下一行 */
			dst_row_ptr = dst_row_ptr +  4 * num_patterns;
		}
	}
}
```