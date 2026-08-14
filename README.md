# 双向奔赴｜恋爱纪念网站

一个为黄双垒和张宁制作的沉浸式恋爱纪念网站。项目使用原生 HTML、CSS 和 JavaScript，无框架、无外部依赖，可以直接部署到 GitHub Pages、Cloudflare Pages 或任意静态托管服务。

## 网站内容

- 恋爱纪念计时与自适应首屏
- 四章节故事时间线
- 手绘相册与键盘可操作的大图浏览
- 可互动的心动理由卡片
- 使用浏览器本地存储的情侣心愿清单
- 情书弹窗、爱心庆祝动画、页面分享
- 给未来留言的本地私密便签
- 日间 / 夜间主题、移动端导航、滚动动效
- 减少动态效果偏好和键盘操作支持

## 本地预览

这是纯静态项目，直接打开 `index.html` 即可浏览。为了获得与线上部署一致的效果，建议在项目目录运行：

```powershell
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173`。

## 个性化位置

- 人物姓名、故事和情书：`index.html`
- 恋爱纪念日：`script.js` 中的 `milestone`
- 色彩、字体和版式：`styles.css` 顶部的 CSS 变量
- 相册图片：`assets/` 目录

心愿清单、主题偏好和私人留言只保存在访客自己的浏览器中，不会上传到服务器。

## 测试

```powershell
npm install
npm test
```

`npm test` 会先校验 HTML，再使用桌面与手机尺寸的 Chrome 测试图片、计时、相册、情书、主题、心愿清单、留言和移动导航。运行 `npm run test:visual` 可以在 `artifacts/` 生成桌面与手机长截图。

## GitHub Pages

仓库已包含 `.nojekyll`，不需要构建步骤。在 GitHub 仓库的 **Settings → Pages** 中选择从 `main` 分支根目录部署即可。

## 项目结构

```text
.
├── assets/          # Web 优化图片和站点图标
├── index.html       # 语义化页面结构与内容
├── styles.css       # 视觉、响应式和动效
├── script.js        # 计时、相册、清单、分享等交互
├── tests/           # Playwright 浏览器测试与视觉截图工具
├── package.json     # 测试命令和开发依赖
└── README.md
```
