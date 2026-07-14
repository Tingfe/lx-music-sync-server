# 自定义音源同步升级说明

本文记录 `Tingfe/lx-music-sync-server` 的 `v2.1.5` 定制改动，以及 Docker 部署的升级方式。

## 此版本的改动

- 新增 `userApi` 同步 feature，与定制移动端配套使用。
- 每个同步账号的音源元信息和完整 JavaScript 脚本保存为独立数据。
- 同账号的在线设备在音源变化时会收到实时同步通知。
- 音源数据保存在数据卷下的 `data/users/<用户目录>/userApi.json`。

现有歌单、收藏和不喜欢列表同步协议保持兼容。旧客户端不认识 `userApi` feature，会自动跳过它；新客户端连接旧服务端时也不会影响既有同步。

## Docker 镜像发布

本仓库推送 `vX.Y.Z` 标签会由 GitHub Actions 构建并推送多架构镜像：

```text
tingfe/lx-music-sync-server:v2.1.5
```

首次发布需要在 GitHub Actions Secrets 配置 `DOCKER_HUB_USER` 和 `DOCKER_HUB_TOKEN`。

## 极空间 Docker 升级

升级前最重要的原则是：**保留原有宿主机数据目录到 `/server/data` 的挂载**。不要删除该目录、Docker volume 或容器的持久化数据。

使用 Docker Compose 时，将镜像版本更新为：

```yaml
image: tingfe/lx-music-sync-server:v2.1.5
```

并确保仍有持久化挂载，例如：

```yaml
volumes:
  - /你的极空间路径/lx-sync-data:/server/data
```

然后在极空间终端或 Docker 管理界面执行等价操作：

```bash
docker compose pull
docker compose up -d
```

若未使用 Compose，可按实际容器名称更新：

```bash
docker pull tingfe/lx-music-sync-server:v2.1.5
docker stop lx-music-sync-server
docker rm lx-music-sync-server
# 使用原来的端口、环境变量和 /server/data 挂载重新 docker run
```

删除并重建容器是安全的，前提是使用原有 `/server/data` 持久化挂载；切勿删除该宿主机目录。

## 推荐升级与验证顺序

1. 先升级 Docker 服务端至 `v2.1.5`。
2. 再安装支持此功能的移动端 Debug APK。
3. 在一台设备导入可信 JS 音源并连接同步服务。
4. 在另一台设备连接同一账号，确认音源自动出现、可加载并正常使用。

首次连接空服务端时，服务端保存第一台设备上传的音源。服务端已有音源后会作为后续设备连接时的权威副本，避免老设备覆盖新配置。

## 安全说明

自定义音源是可执行 JavaScript。该功能仅适合自用或可信成员共享的私有同步服务；不要允许不受信任的用户向共享账号上传脚本。
