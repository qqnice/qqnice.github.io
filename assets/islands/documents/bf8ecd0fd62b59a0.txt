#!/usr/bin/env bash
# 檔案：~/webstack/backup.sh（WEEK3 v2.1）
# 用途：備份 WordPress 資料庫、wp-data Volume、設定檔與憑證
# 用法：./backup.sh
set -euo pipefail

PROJECT_DIR="$HOME/webstack"
BACKUP_ROOT="$HOME/backups"
WP_VOLUME="webstack_wp-data"          # 必須與 compose.yml 的 volumes.wp-data.name 相同（restore.sh 也是）
HELPER_IMAGE="alpine:3.24"            # 用來打包 Volume 的小型 Image
KEEP_DAYS=7                           # 只清除本腳本產生、超過 7 天的備份目錄
REQUIRED="compose.yml .env backup.sh restore.sh nginx site certbot/conf"   # 缺少就停止
OPTIONAL="deploy.sh"                  # 存在才打包（WEEK4 才會有）
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="$BACKUP_ROOT/.partial-$STAMP"   # 先寫在暫存目錄，全部成功才改名
DEST="$BACKUP_ROOT/$STAMP"
OWNER="$(id -u):$(id -g)"

cd "$PROJECT_DIR"
umask 077

echo "[0/5] 事前檢查"
for f in $REQUIRED; do
  [ -e "$f" ] || { echo "停止：缺少 $f" >&2; exit 1; }
done
# Compose 實際使用的 Volume 名稱，必須和本腳本的 WP_VOLUME 一致
docker compose config | grep -cx "    name: $WP_VOLUME" >/dev/null ||
  { echo "停止：compose.yml 使用的 Volume 不是 $WP_VOLUME，請教師確認" >&2; exit 1; }
# Volume 名稱打錯時，docker run 會默默建立一個空 Volume，打包出空的備份
docker volume inspect "$WP_VOLUME" >/dev/null
WP_ID="$(docker compose ps -aq wordpress)"
[ -n "$WP_ID" ] || { echo "停止：找不到 wordpress Container" >&2; exit 1; }
MOUNTED="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/var/www/html"}}{{.Name}}{{end}}{{end}}' "$WP_ID")"
[ "$MOUNTED" = "$WP_VOLUME" ] ||
  { echo "停止：wordpress 實際掛載的是 ${MOUNTED:-（無）}，不是 $WP_VOLUME" >&2; exit 1; }
docker image inspect "$HELPER_IMAGE" >/dev/null ||
  { echo "停止：找不到 $HELPER_IMAGE，請先執行 docker pull $HELPER_IMAGE" >&2; exit 1; }
[ -n "$(docker compose ps -q db)" ] || { echo "停止：db 沒有在執行" >&2; exit 1; }
mkdir -p "$BACKUP_ROOT"
chmod 700 "$BACKUP_ROOT"
mkdir "$WORK"

# 備份期間暫停 WordPress（唯一會寫入資料的服務）。
# 腳本結束時（包括出錯與 Ctrl+C）會嘗試恢復；恢復失敗時明確報錯，結束碼不為 0。
resume() {
  if ! docker compose start wordpress >/dev/null; then
    echo "錯誤：WordPress 沒有恢復運作，請執行 docker compose start wordpress" >&2
    return 1
  fi
}
on_exit() {
  rc=$?
  resume || rc=1
  exit "$rc"
}
trap on_exit EXIT
trap 'exit 130' INT TERM HUP

echo "[1/5] 暫停 WordPress，讓資料庫與檔案停在同一個時間點"
docker compose stop wordpress

echo "[2/5] 匯出資料庫，並記錄文章清單"
docker compose exec -T db sh -c \
  'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers --databases wordpress' \
  > "$WORK/db-wordpress.sql"
grep -q "CREATE TABLE" "$WORK/db-wordpress.sql" ||
  { echo "停止：匯出的 SQL 沒有任何資料表" >&2; exit 1; }
docker compose exec -T db sh -c \
  'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" --batch -e "SELECT ID, post_title, MD5(post_content), post_status FROM wordpress.wp_posts WHERE post_type=\"post\" ORDER BY ID;"' \
  > "$WORK/posts.tsv"

echo "[3/5] 打包 wp-data，並記錄每個檔案的 SHA-256"
# Container 內是另一個 shell，外層的 pipefail 不會帶進去，要自己再設定一次
docker run --rm --network none \
  -v "$WP_VOLUME":/data:ro \
  -v "$WORK":/backup \
  "$HELPER_IMAGE" \
  sh -ec 'set -o pipefail
          test -s /data/index.php; test -s /data/wp-config.php
          tar czf /backup/wp-data.tar.gz -C /data .
          cd /data && find . -type f -print0 | sort -z | xargs -0 sha256sum > /backup/wp-files.sha256'

echo "      WordPress 恢復運作"
trap - EXIT INT TERM HUP
resume                                # 恢復失敗時 set -e 會讓腳本停在這裡，不會顯示「完成」

echo "[4/5] 打包設定檔、腳本與憑證"
ITEMS="$REQUIRED"
for f in $OPTIONAL; do
  if [ -e "$f" ]; then ITEMS="$ITEMS $f"; fi
done
docker run --rm --network none \
  -v "$PROJECT_DIR":/src:ro \
  -v "$WORK":/backup \
  "$HELPER_IMAGE" \
  sh -ec "tar czf /backup/config.tar.gz -C /src $ITEMS
          chown -R $OWNER /backup && chmod 600 /backup/*"

echo "[5/5] 產生檢查碼，完成後才改成正式目錄"
(cd "$WORK" && sha256sum -- * > SHA256SUMS && sha256sum -c --quiet SHA256SUMS)
mv "$WORK" "$DEST"
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d \
  -name '20[0-9][0-9][01][0-9][0-3][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9]' \
  -mtime +"$KEEP_DAYS" -exec rm -rf {} +

echo "完成：$DEST"
ls -lh "$DEST"
