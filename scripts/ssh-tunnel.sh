#!/bin/bash

# SSH 端口转发脚本
# 转发 12club 服务器的 PostgreSQL(5432), Redis(6379), Openlist(5244) 端口
# 支持守护模式：自动检测断开并重连

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

# 守护模式配置
DAEMON_MODE=false
CHECK_INTERVAL=30  # 检查间隔（秒）
RECONNECT_DELAY=5  # 重连延迟（秒）

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -d, --daemon     启用守护模式，自动检测断开并重连"
    echo "  -i, --interval   检查间隔秒数（默认: 30）"
    echo "  -s, --stop       停止所有端口转发"
    echo "  -c, --check      检查端口转发状态"
    echo "  -h, --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 一次性启动端口转发"
    echo "  $0 -d           # 守护模式运行"
    echo "  $0 -d -i 60     # 守护模式，60秒检查一次"
    echo "  $0 -s           # 停止所有转发"
    echo "  $0 -c           # 检查状态"
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--daemon)
                DAEMON_MODE=true
                shift
                ;;
            -i|--interval)
                CHECK_INTERVAL="$2"
                shift 2
                ;;
            -s|--stop)
                stop_all_tunnels
                exit 0
                ;;
            -c|--check)
                check_status
                exit 0
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
}

# 检查端口是否可连接
check_port() {
    local PORT=$1
    nc -z -w 2 localhost $PORT 2>/dev/null
    return $?
}

# 检查 Redis 连接（更严格的检测）
check_redis() {
    # 尝试发送 PING 命令
    echo "PING" | nc -w 2 localhost 6379 2>/dev/null | grep -q "PONG"
    return $?
}

# 检查所有端口状态
check_status() {
    echo -e "${BLUE}端口转发状态检查:${NC}"
    local ALL_OK=true
    
    for PORT in $PORTS; do
        if check_port $PORT; then
            local SERVICE_NAME=""
            case $PORT in
                5432) SERVICE_NAME="PostgreSQL" ;;
                6379) SERVICE_NAME="Redis" ;;
                5244) SERVICE_NAME="Openlist" ;;
            esac
            
            # 对 Redis 进行额外检测
            if [ "$PORT" = "6379" ]; then
                if check_redis; then
                    echo -e "  ${GREEN}✓${NC} $SERVICE_NAME (localhost:$PORT) - 连接正常"
                else
                    echo -e "  ${YELLOW}⚠${NC} $SERVICE_NAME (localhost:$PORT) - 端口开放但 Redis 无响应"
                    ALL_OK=false
                fi
            else
                echo -e "  ${GREEN}✓${NC} $SERVICE_NAME (localhost:$PORT) - 连接正常"
            fi
        else
            echo -e "  ${RED}✗${NC} localhost:$PORT - 连接失败"
            ALL_OK=false
        fi
    done
    
    if $ALL_OK; then
        return 0
    else
        return 1
    fi
}

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

# 停止所有端口转发
stop_all_tunnels() {
    echo -e "${YELLOW}正在停止所有端口转发...${NC}"
    for PORT in $PORTS; do
        PID=$(lsof -ti :$PORT 2>/dev/null | head -1)
        if [ -n "$PID" ]; then
            kill $PID 2>/dev/null
            echo -e "  ${GREEN}✓${NC} 已关闭端口 $PORT (PID: $PID)"
        fi
    done
    echo -e "${GREEN}所有端口转发已停止${NC}"
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
    # 添加 ServerAliveInterval 和 ServerAliveCountMax 保持连接活跃
    ssh -f -N \
        -o ServerAliveInterval=30 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        $FORWARD_ARGS $SSH_HOST
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 端口转发已建立:${NC}"
        echo -e "  - PostgreSQL: localhost:5432"
        echo -e "  - Redis:      localhost:6379"
        echo -e "  - Openlist:   localhost:5244"
        return 0
    else
        echo -e "${RED}✗ 端口转发建立失败${NC}"
        return 1
    fi
}

# 重新建立单个端口的转发
restart_single_port() {
    local PORT=$1
    echo -e "${YELLOW}正在重建端口 $PORT 的转发...${NC}"
    
    # 关闭现有的该端口转发
    PID=$(lsof -ti :$PORT 2>/dev/null | head -1)
    if [ -n "$PID" ]; then
        kill $PID 2>/dev/null
        sleep 0.5
    fi
    
    # 重新建立所有端口转发（因为 SSH 是单连接多端口转发）
    cleanup_existing_tunnels
    sleep 1
    start_tunnels
}

# 守护进程主循环
daemon_loop() {
    echo -e "${BLUE}守护模式已启动${NC}"
    echo -e "  - 检查间隔: ${CHECK_INTERVAL}秒"
    echo -e "  - 按 Ctrl+C 退出"
    echo ""
    
    # 捕获退出信号
    trap 'echo -e "\n${YELLOW}收到退出信号，正在停止...${NC}"; exit 0' SIGINT SIGTERM
    
    local CONSECUTIVE_FAILURES=0
    local MAX_FAILURES=3
    
    while true; do
        sleep $CHECK_INTERVAL
        
        # 检查所有端口
        local NEED_RESTART=false
        
        for PORT in $PORTS; do
            if ! check_port $PORT; then
                echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}检测到端口 $PORT 断开${NC}"
                NEED_RESTART=true
                break
            fi
            
            # 对 Redis 进行额外检测
            if [ "$PORT" = "6379" ] && ! check_redis; then
                echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}Redis 连接异常，准备重连...${NC}"
                NEED_RESTART=true
                break
            fi
        done
        
        if $NEED_RESTART; then
            CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
            
            if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
                echo -e "${RED}连续 $MAX_FAILURES 次重连失败，等待更长时间后重试...${NC}"
                sleep 60
                CONSECUTIVE_FAILURES=0
            fi
            
            echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}正在重新建立连接...${NC}"
            sleep $RECONNECT_DELAY
            cleanup_existing_tunnels
            sleep 1
            
            if start_tunnels; then
                CONSECUTIVE_FAILURES=0
                echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}连接已恢复${NC}"
            else
                echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}重连失败，将在下次检查时重试${NC}"
            fi
        fi
    done
}

# 主流程
parse_args "$@"

cleanup_existing_tunnels
if start_tunnels; then
    if $DAEMON_MODE; then
        daemon_loop
    fi
else
    exit 1
fi
