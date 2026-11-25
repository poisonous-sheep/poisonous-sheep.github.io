/**
 * 文章索引（仅保留你原博客的 3 篇真实文章）与「车票碎片」
 * --------------------------------------------------
 * 以后发新文章只需：
 * 1. 在 posts/ 文件夹新建一个 .md 文件
 * 2. 在下方 BLOG_POSTS 数组最前面增加一条登记即可
 */
window.BLOG_POSTS = [
  {
    id: "01-graph-and-tree",
    no: "01",
    featured: true,
    title: "图论+树",
    date: "2025-04-04",
    weather: "C++ · 图论 · 洛谷",
    category: "算法笔记",
    cover: "images/post-graph-tree.jpg",
    excerpt: "整理图与树的存储方式（邻接矩阵、邻接表、链式前向星），以及洛谷 P5318 查找文献（DFS/BFS）与 B3647 Floyd 最短路模板题解。",
    file: "posts/01-graph-and-tree.md",
    fallbackContent: `# 图？树？

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

\`\`\`cpp
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
\`\`\`

## [B3647 【模板】Floyd - 洛谷](https://www.luogu.com.cn/problem/B3647)

### 题目大意

给 $n$ 个点和 $m$ 条边组成的无向图，求所有 $(i, j)$ 的最短路径。

#### 数据范围

对于 100% 的数据，$n \\le 100$，$m \\le 4500$，任意一条边的权值 $w$ 是正整数且 $1 \\le w \\le 1000$。

### 题解

#### Floyd 的板子题~~（本质上是动态规划）~~

$f[i][j]$ 为 $i$ 到 $j$ 的最短路径，本质上是一个三维状态数组 $f[i][j][k]$ 为从 $i$ 到 $j$ 期间经过了 $1$ 到 $k$ 这些点。

\`\`\`cpp
for(int k=1; k<=n; k++) 
	for(int i=1; i<=n; i++) 
		for(int j=1; j<=n; j++)
			f[i][j]=min(f[i][j],f[i][k]+f[k][j]); 
\`\`\`

#### 参考写法

\`\`\`cpp
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
\`\`\``
  },
  {
    id: "02-data-structure",
    no: "02",
    title: "数据结构",
    date: "2025-04-03",
    weather: "C++ · 单调队列 · 洛谷",
    category: "算法笔记",
    cover: "images/post-data-structure.png",
    excerpt: "数据结构进阶：结合洛谷 P1886 滑动窗口模板，总结单调队列的核心性质（老而更劣的元素永远不可能成为最值）与完整 C++ 代码。",
    file: "posts/02-data-structure.md",
    fallbackContent: `# 数据结构（进阶一点）

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

\`\`\`text
8 3
1 3 -1 -3 5 3 6 7
\`\`\`

输出：

\`\`\`text
-1 -3 -3 -3 3 3
3 3 5 5 6 7
\`\`\`

### 单调队列的性质

1. 队列中的元素其对应在原来的列表中的顺序必须是单调递增的。
2. 队列中元素的大小必须是单调的（增 / 减 / 甚至是自定义也可以）。

核心思想是：**老而更劣的元素永远不可能成为最值**。

例如：在从左往右滑动窗口求最小值时，考虑右侧新加入一个元素 $a_j$ 时会发生什么。假设区间中已经有的一个元素 $a_i$ 使得 $a_i \\ge a_j$，那么 $a_j$ 离开窗口一定比 $a_i$ 要晚，且今后 $a_i$ 在队列里的时候 $a_j$ 也一直在队列里。在 $a_i$ 剩下的生命里直到离开区间，$a_j$ 永远比它小，$a_i$ 再也不可能成为（唯一的）最小值了。

### Code

\`\`\`cpp
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
	cout<<"\\n";
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
\`\`\``
  },
  {
    id: "03-first-blog",
    no: "03",
    title: "第一个博客！",
    date: "2025-04-03",
    weather: "日常 · 第五人格",
    category: "碎碎念",
    cover: "images/post-first-blog.png",
    excerpt: "小羊第一次写也很激动！放点神秘春卷饭、搞个音乐、重音 Teto 🥖，还有第五人格启动！",
    file: "posts/03-first-blog.md",
    fallbackContent: `# 第一个博客！

## 小羊第一次写也很激动

#### 第一次写自己的博客，以后会慢慢美化的！！

1. 放点神秘春卷饭
2. 搞个音乐 ✅（已换装拿不拿唱片架与轻柔吉他泛音）
3. 放个看板娘 ✅（重音 Teto 🥖）
4. 动态加载页面 ✅
5. 第五人格启动`
  }
];

/**
 * 车票碎片（围绕你真实爱好的轻便签，随时可在 js/data.js 中增删）
 */
window.BLOG_FRAGMENTS = [
  {
    serial: "TK-0404",
    route: "图论 → 最短路",
    tag: "算法",
    date: "2025.04.04",
    time: "12:00",
    sky: "洛谷 · C++",
    text: "Floyd 的板子本质上就是三维动态规划，记住 k 一定要写在最外层循环！"
  },
  {
    serial: "TK-0403",
    route: "滑动窗口 → AC",
    tag: "算法",
    date: "2025.04.03",
    time: "18:00",
    sky: "单调队列",
    text: "单调队列核心思想只有一句：老而更劣的元素永远不可能成为最值。"
  },
  {
    serial: "TK-0402",
    route: "春卷饭 → 拿不拿",
    tag: "术力口",
    date: "2025.04.03",
    time: "12:00",
    sky: "Teto 🥖",
    text: "小羊的小小窝换上了盛夏拿不拿新皮肤，里面依然藏着一份神秘春卷饭！"
  },
  {
    serial: "TK-0401",
    route: "站台 → 庄园",
    tag: "日常",
    date: "2025.04.03",
    time: "21:30",
    sky: "游戏时间",
    text: "刷完题休息一下——第五人格启动！"
  }
];
