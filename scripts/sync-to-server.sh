#!/usr/bin/env bash
# 将本地当前分支的最新 commit 同步到 12club 服务器 ~/12club
# 效果等价于服务器执行 git pull（未提交的改动不会被同步）
#
# 用法: ./scripts/sync-to-server.sh

set -euo pipefail

SSH_HOST="12club"
REMOTE_DIR="\$HOME/12club"   # 在远端 shell 中展开
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$LOCAL_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误: 当前目录不是 git 仓库" >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
SHA="$(git rev-parse HEAD)"
BUNDLE="$(mktemp -t 12club-sync.XXXXXX.bundle)"
trap 'rm -f "$BUNDLE"' EXIT

echo "==> 本地分支: $BRANCH @ ${SHA:0:12}"

echo "==> 打包所有 commits"
git bundle create "$BUNDLE" --all >/dev/null

REMOTE_BUNDLE="/tmp/12club-sync-$$.bundle"

echo "==> 上传 bundle 到 ${SSH_HOST}"
scp -q "$BUNDLE" "${SSH_HOST}:${REMOTE_BUNDLE}"

echo "==> 在服务器应用变更"
ssh "$SSH_HOST" REMOTE_BUNDLE="$REMOTE_BUNDLE" BRANCH="$BRANCH" SHA="$SHA" REMOTE_DIR="$REMOTE_DIR" bash <<'REMOTE'
set -euo pipefail
cd "$REMOTE_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误: 远端 $REMOTE_DIR 不是 git 仓库" >&2
  rm -f "$REMOTE_BUNDLE"
  exit 1
fi

# 从 bundle 拉取所有 refs 到本地（覆盖同名分支）
git fetch --update-head-ok --force "$REMOTE_BUNDLE" "+refs/heads/*:refs/heads/*"

# 切到目标分支并 reset 到指定 commit（等价于 pull 后的状态）
git checkout -q "$BRANCH"
git reset -q --hard "$SHA"

rm -f "$REMOTE_BUNDLE"

echo "远端已同步到: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)"
REMOTE

echo "==> 同步完成"
