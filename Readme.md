# LX Music 私有同步服务

这是 `Tingfe` 维护的 LX Music 私有同步服务端，为手机、桌面与车机提供同账号的数据同步和在线车机控制能力。

- Docker 镜像：[`tingfe/lx-music-sync-server`](https://hub.docker.com/r/tingfe/lx-music-sync-server)
- 客户端：[`lx-music-mobile`](https://github.com/Tingfe/lx-music-mobile)、[`lx-music-desktop`](https://github.com/Tingfe/lx-music-desktop)、[`lx-music-car`](https://github.com/Tingfe/lx-music-car)
- 当前服务端版本：`v2.1.11`

## 本 Fork 的功能

- 同步歌单、收藏与不喜欢列表。
- 同步自定义音源的元信息和完整 JavaScript 脚本；同账号在线设备可实时收到更新。
- 同步跨平台语义一致的播放、搜索、歌词与列表偏好；语言、主题、路径、音频设备和窗口配置保持各终端本地独立，避免跨端错用。
- 支持同账号在线车机：手机可读取车机播放状态、切歌、播放/暂停，并将手机当前歌曲发送给车机。
- 保持旧客户端兼容：不认识的扩展同步 feature 会被跳过，原有同步不受影响。

## Docker 部署与升级

极空间等 Docker 环境建议持久化挂载 `/server/data`：

```yaml
services:
  lx-sync:
    image: tingfe/lx-music-sync-server:v2.1.11
    container_name: lx-music-sync-server
    restart: unless-stopped
    ports:
      - "9527:9527"
    volumes:
      - /你的数据目录/lx-music-sync:/server/data
```

升级时只需更新镜像并重建容器，**不要删除宿主机的数据目录**：

```bash
docker compose pull
docker compose up -d
```

服务端不提供浏览器管理后台；日常管理通过 Docker 管理页、容器日志、持久化数据目录和客户端同步设置完成。公网使用时必须经由可信 HTTPS 反向代理，并正确转发 WebSocket。

完整部署、迁移、数据恢复与兼容性说明见：[升级说明](docs/CUSTOM_SOURCE_SYNC_UPGRADE.md)。

## 使用方式

1. 部署服务端并确保客户端可访问其地址。
2. 在手机、桌面或车机端的「设置 → 数据同步」填入同一服务地址、账号和连接码。
3. 先升级服务端，再升级客户端；首次接入时以服务端已有数据为准。

自定义音源是可执行 JavaScript，只应在你信任的设备、账号和私有服务之间同步。

## 上游项目与许可证

本仓库基于 [lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) 维护；上游的完整原始使用说明、Node.js/PM2 安装、Nginx 配置、快照恢复和环境变量清单请参阅其 [README](https://github.com/lyswhut/lx-music-sync-server#readme)。

本项目遵循仓库中的 [Apache-2.0 License](LICENSE) 及其适用说明。
