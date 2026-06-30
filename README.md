# 黄双垒 & 张宁婚礼邀请网页

这是一个可直接部署到 Cloudflare Pages 的静态婚礼邀请网页。

## 本地预览

直接打开 `index.html` 即可预览。也可以用任意静态服务器托管当前文件夹。

## Cloudflare Pages 部署

1. 将本文件夹推送到 Git 仓库。
2. 在 Cloudflare Pages 中创建项目并连接仓库。
3. 构建设置保持为空：
   - Build command: 留空
   - Build output directory: `/`
4. 部署后，在项目的 Custom domains 中绑定 `黄双垒-张宁.love`。

## 文件

- `index.html`: 页面结构与内容
- `styles.css`: 视觉风格与响应式布局
- `script.js`: 婚礼倒计时
- `calendar.ics`: 加入日历文件
- `Gemini_Generated_Image_4hxujj4hxujj4hxu.png`: 请柬参考主视觉
