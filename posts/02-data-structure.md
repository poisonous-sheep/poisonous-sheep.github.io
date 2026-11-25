# 数据结构（进阶一点）

## 1. 单调队列

### 例题：[P1886 滑动窗口 /【模板】单调队列 - 洛谷](https://www.luogu.com.cn/problem/P1886)

#### 题目描述

有一个长为 $n$ 的序列 $a$，以及一个大小为 $k$ 的窗口。现在这个窗口从左边开始向右滑动，每次滑动一个单位，求出每次滑动后窗口中的最大值和最小值。

![滑动窗口示意图](images/post-sliding-window.png)

### 输入格式

输入一共有两行，第一行有两个正整数 $n, k$。第二行 $n$ 个整数，表示序列 $a$。

### 输出格式

输出共两行，第一行为每次窗口滑动的最小值，第二行为每次窗口滑动的最大值。

### 样例

输入：

```text
8 3
1 3 -1 -3 5 3 6 7
```

输出：

```text
-1 -3 -3 -3 3 3
3 3 5 5 6 7
```

### 单调队列的性质

1. 队列中的元素其对应在原来的列表中的顺序必须是单调递增的。
2. 队列中元素的大小必须是单调的（增 / 减 / 甚至是自定义也可以）。

核心思想是：**老而更劣的元素永远不可能成为最值**。

例如：在从左往右滑动窗口求最小值时，考虑右侧新加入一个元素 $a_j$ 时会发生什么。假设区间中已经有的一个元素 $a_i$ 使得 $a_i \ge a_j$，那么 $a_j$ 离开窗口一定比 $a_i$ 要晚，且今后 $a_i$ 在队列里的时候 $a_j$ 也一直在队列里。在 $a_i$ 剩下的生命里直到离开区间，$a_j$ 永远比它小，$a_i$ 再也不可能成为（唯一的）最小值了。

### Code

```cpp
#include<bits/stdc++.h>
#define int long long
using namespace std;
const int N=1e6+5,inf=1e18;
int n,m;
int a[N];
int q[N];
signed main(){
	ios::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>m;
	for(int i=1;i<=n;i++){
		cin>>a[i];
	} 
	int l=1,r=0;
	for(int i=1;i<=n;i++){
		while(l<=r && a[q[r]]>=a[i]){
			r--;
		}
		while(l<=r && q[l]+m<=i){
			l++;
		}
		q[++r]=i;
		if(i>=m){
			cout<<a[q[l]]<<" ";
		}
	}
	cout<<"\n";
	l=1,r=0;
	for(int i=1;i<=n;i++){
		while(l<=r && a[q[r]]<=a[i]){
			r--;
		}
		while(l<=r && q[l]+m<=i){
			l++;
		}
		q[++r]=i;
		if(i>=m){
			cout<<a[q[l]]<<" ";
		}
	}
	return 0;
}
```
