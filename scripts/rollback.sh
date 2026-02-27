#!/bin/bash

# 快速回滚脚本
# 切换到上一个部署版本，秒级回滚

set -e

APP_NAME="nextjs-12club"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BLUE_PORT=9000
GREEN_PORT=9001
NGINX_CONF="/etc/nginx/nginx.conf"
MAX_HEALTH_RETRIES=20
HEALTH_RETRY_INTERVAL=2
HEALTH_CHECK_URL_PATH="/"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

get_port() {
  if [ "$1" = "blue" ]; then echo "$BLUE_PORT"; else echo "$GREEN_PORT"; fi
}

get_pm2_name() {
  echo "${APP_NAME}-$1"
}

switch_nginx_port() {
  local NEW_PORT=$1
  log_info "切换 Nginx 代理到端口 ${NEW_PORT}..."
  sudo sed -i "s|proxy_pass http://localhost:[0-9]\+;|proxy_pass http://localhost:${NEW_PORT};|" "$NGINX_CONF"
  if ! sudo nginx -t 2>/dev/null; then
    log_error "Nginx 配置语法错误！"
    return 1
  fi
  sudo nginx -s reload
  log_success "Nginx 已切换到端口 ${NEW_PORT}"
}

health_check() {
  local PORT=$1
  local RETRIES=0
  while [ $RETRIES -lt $MAX_HEALTH_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT${HEALTH_CHECK_URL_PATH}" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
      return 0
    fi
    RETRIES=$((RETRIES + 1))
    sleep $HEALTH_RETRY_INTERVAL
  done
  return 1
}

cd "$APP_DIR"

STATE_FILE="$APP_DIR/.deploy-state"
if [ ! -f "$STATE_FILE" ]; then
  log_error "没有找到部署状态文件，无法回滚"
  exit 1
fi

CURRENT_COLOR=$(cat "$STATE_FILE")
if [ "$CURRENT_COLOR" = "blue" ]; then
  ROLLBACK_COLOR="green"
else
  ROLLBACK_COLOR="blue"
fi

CURRENT_PORT=$(get_port "$CURRENT_COLOR")
ROLLBACK_PORT=$(get_port "$ROLLBACK_COLOR")
CURRENT_PM2=$(get_pm2_name "$CURRENT_COLOR")
ROLLBACK_PM2=$(get_pm2_name "$ROLLBACK_COLOR")

log_info "========================================="
log_info "  12Club 回滚"
log_info "========================================="
log_info "当前: ${CURRENT_COLOR} (端口 ${CURRENT_PORT})"
log_info "回滚到: ${ROLLBACK_COLOR} (端口 ${ROLLBACK_PORT})"
echo ""

# 尝试重启上一版本的 PM2 实例（deploy 时只 stop 不 delete，所以可以直接 restart）
log_info "正在启动 ${ROLLBACK_COLOR} 实例..."
if pm2 restart "$ROLLBACK_PM2" 2>/dev/null; then
  log_info "已重启保留的 ${ROLLBACK_COLOR} 实例"
else
  # 如果实例不存在，重新创建
  log_info "未找到保留实例，重新启动..."
  pm2 stop "$ROLLBACK_PM2" 2>/dev/null || true
  pm2 delete "$ROLLBACK_PM2" 2>/dev/null || true
  PORT=$ROLLBACK_PORT pm2 start npm --name "$ROLLBACK_PM2" -- start -- -p "$ROLLBACK_PORT"
fi

log_info "健康检查中..."
if ! health_check "$ROLLBACK_PORT"; then
  log_error "回滚实例启动失败！当前实例仍在运行。"
  pm2 stop "$ROLLBACK_PM2" 2>/dev/null || true
  exit 1
fi

log_success "健康检查通过"

# 切换 Nginx 流量
if ! switch_nginx_port "$ROLLBACK_PORT"; then
  log_error "Nginx 切换失败！当前实例仍在运行。"
  exit 1
fi

# 停止当前实例（保留不删除，以便再次回滚）
log_info "停止当前实例 ${CURRENT_COLOR}..."
pm2 stop "$CURRENT_PM2" 2>/dev/null || true

# 更新状态
echo "$ROLLBACK_COLOR" > "$STATE_FILE"

echo ""
log_success "========================================="
log_success "  回滚成功！"
log_success "  活跃实例: ${ROLLBACK_COLOR} (端口 ${ROLLBACK_PORT})"
log_success "  Nginx 已指向: localhost:${ROLLBACK_PORT}"
log_success "========================================="

pm2 save 2>/dev/null || true
