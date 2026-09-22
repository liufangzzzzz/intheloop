# In The Loop 独立官网

`https://intheloop.geekpark.net` 的中英文公开站。仓库只包含公开页面、地图、搜索和文章阅读界面，不包含运营密码、AI Key、上传能力或数据库。

## 内容流向

编辑在 `jk-toolkit-intheloop` 运营工作台完成。发布后的中英文内容通过只读接口提供给本站：

```text
运营工作台 → GET /api/v1/public/atlas/{zh|en} → 独立官网
```

中文原文可以跳转极客公园、微信公众号或小宇宙；英文正文由本站承载。

## 本地运行

```bash
cp .env.example .env
npm ci
npm run dev
```

默认读取 `http://127.0.0.1:8000`。本地后端使用其他端口时，在 `.env` 中设置：

```text
INTHELOOP_CONTENT_API_ORIGIN=http://127.0.0.1:8017
```

## 服务器环境变量

生产只需要两个地址变量，不需要任何账号密码：

```text
ITL_PUBLIC_ORIGIN=https://intheloop.geekpark.net
INTHELOOP_CONTENT_API_ORIGIN=https://toolkit-intheloop.geekpark.net
```

推送 `main` 后，GitHub Actions 构建 `ghcr.io/geekpark-hub/intheloop/frontend:latest`。服务器使用 `compose.yaml` 启动，反向代理把 `intheloop.geekpark.net` 指向 `127.0.0.1:3001`。

## 验证

```bash
npm test
npm run lint
npm run build
```
