---
title: "图论+树"
slug: "图论-树"
date: 2025-04-04T12:00:00+08:00
image: cover.jpg
categories:
  - 算法笔记
tags:
  - C++
  - 图论
  - 洛谷
---

# 图？树？

在我们写题目之前我们应该学习一下图和树的存储方式：
1. 邻接矩阵
2. 邻接表
3. 链式前向星（静态链表）

掌握这些基础的存储方式我们才能解决关于图和树的问题，请各位同学自行学习。

## [P5318 【深基18.例3】查找文献 - 洛谷](https://www.luogu.com.cn/problem/P5318)

### 题目大意

其实就是给你一张有向图，要你把它深度遍历一遍再广度遍历一遍。

### 题解

#### 用 BFS 和 DFS 遍历

```cpp
struct edge{       //存边结构体
	int u,v;
}; 
vector <int> e[100001];  
vector <edge> s;
bool vis1[100001]={0},vis2[100001]={0}; //标记数组
void dfs(int x){  //深度优先遍历
	vis1[x]=1;
	cout<<x<<" ";
	for(int i=0;i<e[x].size();i++){
		int point=s[e[x][i]].v;
		if(!vis1[point]){
			dfs(point);
		}
	}
}
void bfs(int x){  //广度优先遍历
	queue <int> q;
	q.push(x);
	cout<<x<<" ";
	vis2[x]=1;
	while(!q.empty()){
		int fro=q.front();
		for(int i=0;i<e[fro].size();i++){
			int point=s[e[fro][i]].v;
			if(!vis2[point]){
				q.push(point); 
				cout<<point<<" ";
				vis2[point]=1;
			}
		}
		q.pop();
	}
}
```

## [B3647 【模板】Floyd - 洛谷](https://www.luogu.com.cn/problem/B3647)

### 题目大意

给 $n$ 个点和 $m$ 条边组成的无向图，求所有 $(i, j)$ 的最短路径。

#### 数据范围

对于 100% 的数据，$n \le 100$，$m \le 4500$，任意一条边的权值 $w$ 是正整数且 $1 \le w \le 1000$。

### 题解

#### Floyd 的板子题~~（本质上是动态规划）~~

$f[i][j]$ 为 $i$ 到 $j$ 的最短路径，本质上是一个三维状态数组 $f[i][j][k]$ 为从 $i$ 到 $j$ 期间经过了 $1$ 到 $k$ 这些点。

```cpp
for(int k=1; k<=n; k++) 
	for(int i=1; i<=n; i++) 
		for(int j=1; j<=n; j++)
			f[i][j]=min(f[i][j],f[i][k]+f[k][j]); 
```

#### 参考写法

```cpp
void solve () {
    cin>>n>>m;
	for(int i=1;i<=n;++i)for(int j=1;j<=n;++j){
		if(i==j)dis[i][j]=0;
		else dis[i][j]=INF;
	}
	int v1,v2;ll w;
	for(int i=0;i<m;++i){
		cin>>v1>>v2>>w;
		//取重边时较小的边 
		dis[v2][v1]=dis[v1][v2]=min(dis[v1][v2],w);
	}
	for(int k=1;k<=n;++k){
		for(int i=1;i<=n;++i){
			for(int j=1;j<=n;++j){
				if((i!=j)&&(i!=k)&&(j!=k))
				dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
			}
		}
	}
	for(int i=1;i<=n;++i){
		for(int j=1;j<=n;++j){
			if(j>1)cout<<" ";
			cout<<dis[i][j];
		}
		cout<<endl; 
	}
}
```
