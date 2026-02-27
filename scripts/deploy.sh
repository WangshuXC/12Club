#!/bin/bash

# 蓝绿部署脚本
# 实现零停机部署和编译失败自动回滚

set -e

# ============ 配置 ============
APP_NAME="nextjs-12club"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BLUE_PORT=9000    # 蓝色实例端口
GREEN_PORT=9001   # 绿色实例端口
NGINX_CONF="/etc/nginx/nginx.conf"
HEALTH_CHECK_URL_PATH="/"  # 健康检查路径
MAX_HEALTH_RETRIES=30      # 健康检查最大重试次数
HEALTH_RETRY_INTERVAL=2    # 每次重试间隔（秒）

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============ 工具函数 ============

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取当前活跃的实例颜色（blue 或 green）
get_active_color() {
  local STATE_FILE="$APP_DIR/.deploy-state"
  if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
  else
    echo "none"
  fi
}

# 保存当前活跃实例的颜色
save_active_color() {
  echo "$1" > "$APP_DIR/.deploy-state"
}

# 根据颜色获取端口
get_port() {
  if [ "$1" = "blue" ]; then
    echo "$BLUE_PORT"
  else
    echo "$GREEN_PORT"
  fi
}

# 根据颜色获取 PM2 实例名
get_pm2_name() {
  echo "${APP_NAME}-$1"
}

# 切换 Nginx 代理端口并 reload
switch_nginx_port() {
  local NEW_PORT=$1
  log_info "切换 Nginx 代理到端口 ${NEW_PORT}..."

  # 替换 proxy_pass 中 Next.js 主站点的端口（只替换 location / 块中的）
  sudo sed -i "s|proxy_pass http://localhost:[0-9]\+;|proxy_pass http://localhost:${NEW_PORT};|" "$NGINX_CONF"

  # 验证 Nginx 配置语法
  if ! sudo nginx -t 2>/dev/null; then
    log_error "Nginx 配置语法错误！"
    return 1
  fi

  # 平滑重载 Nginx（不中断现有连接）
  sudo nginx -s reload
  log_success "Nginx 已切换到端口 ${NEW_PORT}"
}

# 健康检查
health_check() {
  local PORT=$1
  local RETRIES=0

  log_info "正在进行健康检查 (localhost:$PORT)..."

  while [ $RETRIES -lt $MAX_HEALTH_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT${HEALTH_CHECK_URL_PATH}" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
      log_success "健康检查通过 (HTTP $HTTP_CODE)"
      return 0
    fi

    RETRIES=$((RETRIES + 1))
    echo -e "  等待中... ($RETRIES/$MAX_HEALTH_RETRIES) HTTP=$HTTP_CODE"
    sleep $HEALTH_RETRY_INTERVAL
  done

  log_error "健康检查失败，已重试 $MAX_HEALTH_RETRIES 次"
  return 1
}

# ============ 主流程 ============

cd "$APP_DIR"

log_info "========================================="
log_info "  12Club 蓝绿部署"
log_info "========================================="

# 1. 确定当前活跃实例和目标实例
ACTIVE_COLOR=$(get_active_color)

if [ "$ACTIVE_COLOR" = "blue" ]; then
  TARGET_COLOR="green"
elif [ "$ACTIVE_COLOR" = "green" ]; then
  TARGET_COLOR="blue"
else
  # 首次部署，使用 blue
  TARGET_COLOR="blue"
fi

ACTIVE_PORT=$(get_port "$ACTIVE_COLOR")
TARGET_PORT=$(get_port "$TARGET_COLOR")
ACTIVE_PM2=$(get_pm2_name "$ACTIVE_COLOR")
TARGET_PM2=$(get_pm2_name "$TARGET_COLOR")

log_info "当前活跃: ${ACTIVE_COLOR} (端口 ${ACTIVE_PORT})"
log_info "部署目标: ${TARGET_COLOR} (端口 ${TARGET_PORT})"
echo ""

# 2. 编译项目（旧实例继续运行，网站不受影响）
log_info "开始编译项目..."
BUILD_START=$(date +%s)

if ! next build; then
  log_error "============================================"
  log_error "  编译失败！当前活跃实例不受影响。"
  log_error "  网站仍在正常运行于 ${ACTIVE_COLOR} (端口 ${ACTIVE_PORT})"
  log_error "============================================"
  exit 1
fi

BUILD_END=$(date +%s)
BUILD_DURATION=$((BUILD_END - BUILD_START))
log_success "编译成功！耗时 ${BUILD_DURATION} 秒"
echo ""

# 3. 停止目标实例（如果存在残留）
log_info "准备启动 ${TARGET_COLOR} 实例..."
pm2 stop "$TARGET_PM2" 2>/dev/null || true
pm2 delete "$TARGET_PM2" 2>/dev/null || true

# 4. 在新端口启动新实例
log_info "在端口 ${TARGET_PORT} 启动 ${TARGET_COLOR} 实例..."
PORT=$TARGET_PORT pm2 start npm --name "$TARGET_PM2" -- start -- -p "$TARGET_PORT"

# 5. 健康检查新实例
echo ""
if ! health_check "$TARGET_PORT"; then
  log_error "新实例启动失败，正在清理..."
  pm2 stop "$TARGET_PM2" 2>/dev/null || true
  pm2 delete "$TARGET_PM2" 2>/dev/null || true
  log_info "当前活跃实例 ${ACTIVE_COLOR} 仍在正常运行"
  exit 1
fi

# 6. 切换 Nginx 流量到新实例
echo ""
if ! switch_nginx_port "$TARGET_PORT"; then
  log_error "Nginx 切换失败，正在清理新实例..."
  pm2 stop "$TARGET_PM2" 2>/dev/null || true
  pm2 delete "$TARGET_PM2" 2>/dev/null || true
  log_info "当前活跃实例 ${ACTIVE_COLOR} 仍在正常运行"
  exit 1
fi

# 7. 停止旧实例
if [ "$ACTIVE_COLOR" != "none" ]; then
  log_info "正在停止旧实例 ${ACTIVE_COLOR} (端口 ${ACTIVE_PORT})..."
  pm2 stop "$ACTIVE_PM2" 2>/dev/null || true
  # 注意：不 delete 旧实例，保留以便快速回滚
fi

# 8. 保存状态
save_active_color "$TARGET_COLOR"

echo ""
log_success "========================================="
log_success "  部署成功！"
log_success "  活跃实例: ${TARGET_COLOR} (端口 ${TARGET_PORT})"
log_success "  Nginx 已指向: localhost:${TARGET_PORT}"
log_success "  编译耗时: ${BUILD_DURATION} 秒"
log_success "========================================="
log_info "如需回滚，执行: npm run rollback"

pm2 save 2>/dev/null || true
