# 小羊的小小窝（poisonous-sheep.github.io）

> 作者：**有毒的羊** · 游戏 + 学习 + 术力口！
> 线上地址：https://poisonous-sheep.github.io/

本站采用零构建静态架构，以早年 **n-buna（拿不拿）** 与早期 **Yorushika** 实体唱片美学为视觉灵感，完整迁移并保留了原站的全部算法笔记、日常文章、头像与社交链接。

## 如何发布新文章

1. 在 `posts/` 文件夹中新建一个 `.md` 文件（支持 Markdown 代码块与 `$...$` LaTeX 数学公式）。
2. 在 `js/data.js` 的 `BLOG_POSTS` 数组最前面添加一条文章登记。
3. 提交并推送到 `main` 分支，GitHub Actions（`.github/workflows/pages.yml`）会在约 30 秒内自动部署上线。
