#!/usr/bin/env bash
# 檔案：~/webstack/restore.sh（WEEK3 v2.1）
# 用途：在「Volume 已經不存在」的情況下，從 backup.sh 的備份還原資料庫與 wp-data
# 用法：./restore.sh ~/backups/20261021-140530
set -euo pipefail

SRC="${1:?請指定備份目錄，例如 ./restore.sh ~/backups/20261021-140530}"
SRC="$(cd "$SRC" && pwd)"
PROJECT_DIR="$HOME/webstack"
DB_VOLUME="webstack_db-data"          # 兩個名稱必須與 compose.yml 的 volumes.*.name 相同（backup.sh 也是）
WP_VOLUME="webstack_wp-data"
HELPER_IMAGE="alpine:3.24"

cd "$PROJECT_DIR"

echo "[0/6] 檢查備份與環境（這一步不會改動任何東西）"
for f in db-wordpress.sql posts.tsv wp-data.tar.gz wp-files.sha256 config.tar.gz SHA256SUMS; do
  [ -s "$SRC/$f" ] || { echo "停止：備份缺少 $f" >&2; exit 1; }
done
(cd "$SRC" && sha256sum -c --quiet SHA256SUMS)
tar tzf "$SRC/wp-data.tar.gz" | grep -cx './wp-config.php' >/dev/null ||
  { echo "停止：wp-data.tar.gz 裡沒有 wp-config.php" >&2; exit 1; }
docker image inspect "$HELPER_IMAGE" >/dev/null ||
  { echo "停止：找不到 $HELPER_IMAGE，請先執行 docker pull $HELPER_IMAGE" >&2; exit 1; }
for v in "$DB_VOLUME" "$WP_VOLUME"; do
  # Compose 實際使用的 Volume 名稱，必須和本腳本一致，否則下面的防呆檢查會檢查錯對象
  docker compose config | grep -cx "    name: $v" >/dev/null ||
    { echo "停止：compose.yml 使用的 Volume 不是 $v，請教師確認" >&2; exit 1; }
  if docker volume inspect "$v" >/dev/null 2>&1; then
    echo "停止：$v 仍然存在。本腳本只在 Volume 已不存在時還原，避免覆蓋現有資料。" >&2
    exit 1
  fi
done

echo "[1/6] 停止服務"
docker compose down

echo "[2/6] 建立 Container 與空的 Volume（先不啟動）"
docker compose create

echo "[3/6] 還原 wp-data，並比對每個檔案的 SHA-256"
docker run --rm --network none \
  -v "$WP_VOLUME":/data \
  -v "$SRC":/backup:ro \
  "$HELPER_IMAGE" \
  sh -ec 'set -o pipefail
          tar xzf /backup/wp-data.tar.gz -C /data
          cd /data && find . -type f -print0 | sort -z | xargs -0 sha256sum > /tmp/after.sha256
          diff /backup/wp-files.sha256 /tmp/after.sha256 >/dev/null ||
            { echo "停止：還原後的檔案與備份不一致" >&2; exit 1; }'
echo "      檔案比對一致"

echo "[4/6] 啟動資料庫，等待健康檢查通過後匯入"
docker compose up -d --wait --wait-timeout 180 db
docker compose exec -T db sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD"' \
  < "$SRC/db-wordpress.sql"

echo "[5/6] 比對文章清單"
AFTER="$(mktemp)"
docker compose exec -T db sh -c \
  'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" --batch -e "SELECT ID, post_title, MD5(post_content), post_status FROM wordpress.wp_posts WHERE post_type=\"post\" ORDER BY ID;"' \
  > "$AFTER"
diff "$SRC/posts.tsv" "$AFTER" ||
  { echo "停止：文章清單與備份不一致（上方為差異）" >&2; exit 1; }
rm -f "$AFTER"
echo "      文章比對一致"

echo "[6/6] 啟動全部服務"
docker compose up -d --wait --wait-timeout 180
docker compose ps
echo "還原完成。請用瀏覽器確認文章、圖片與後台登入。"
