#!/bin/bash

# SSH 端口转发脚本
# 转发 12club 服务器的 PostgreSQL(5432), Redis(6379), Openlist(5244) 端口

PORTS="5432 6379 5244"

# SSH_HOST: SSH 连接别名，需要在 ~/.ssh/config 中配置
# 
# 配置示例 (~/.ssh/config):
# ----------------------------------------
# # 跳板机配置（如需通过跳板机访问）
# Host jump-server
#     HostName jump.example.com        # 跳板机地址
#     User your-username               # 跳板机用户名
#     Port 22                          # 跳板机 SSH 端口
#     IdentityFile ~/.ssh/id_rsa       # 私钥文件路径
#
# # 目标服务器配置
# Host 12club
#     HostName 222.30.60.30            # 目标服务器内网 IP 或域名
#     User your-username               # 目标服务器用户名
#     Port 22                          # 目标服务器 SSH 端口
#     IdentityFile ~/.ssh/id_rsa       # 私钥文件路径
#     ProxyJump jump-server            # 通过跳板机连接（如直连则删除此行）
#
# # 如果是直连（无跳板机），只需配置:
# Host 12club
#     HostName 222.30.60.30      # 服务器地址
#     User your-username
#     IdentityFile ~/.ssh/id_rsa
# ----------------------------------------
SSH_HOST="12club"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查并关闭已存在的端口转发
cleanup_existing_tunnels() {
    for PORT in $PORTS; do
        # 查找占用本地端口的 SSH 进程
        PID=$(lsof -ti :$PORT 2>/dev/null | head -1)
        if [ -n "$PID" ]; then
            echo -e "${YELLOW}端口 $PORT 已被占用 (PID: $PID)，正在关闭...${NC}"
            kill $PID 2>/dev/null
            sleep 0.5
        fi
    done
}

# 启动端口转发
start_tunnels() {
    echo -e "${GREEN}正在建立 SSH 端口转发到 $SSH_HOST...${NC}"
    
    # 构建端口转发参数
    FORWARD_ARGS=""
    for PORT in $PORTS; do
        FORWARD_ARGS="$FORWARD_ARGS -L $PORT:localhost:$PORT"
    done
    
    # 后台启动 SSH 端口转发
    ssh -f -N $FORWARD_ARGS $SSH_HOST
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 端口转发已建立:${NC}"
        echo -e "  - PostgreSQL: localhost:5432"
        echo -e "  - Redis:      localhost:6379"
        echo -e "  - Openlist:      localhost:5244"
    else
        echo -e "${RED}✗ 端口转发建立失败${NC}"
        exit 1
    fi
}

# 主流程
cleanup_existing_tunnels
start_tunnels
