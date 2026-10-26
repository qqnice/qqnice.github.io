#!/usr/bin/env python3
"""Build the teaching index and release metadata before a manual Pages deployment."""
import json
import os
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable, str(ROOT / "tools/build_catalog.py")], cwd=ROOT, check=True)
catalog = json.loads((ROOT / "assets/islands/catalog.json").read_text(encoding="utf-8"))
if not catalog:
    raise SystemExit("教材目錄不可為空，停止發布。")
seen = set()
for item in catalog:
    if not all(item.get(key) for key in ("id", "island", "topic", "title", "path")):
        raise SystemExit(f"教材缺少必要欄位：{item}")
    if item["id"] in seen:
        raise SystemExit(f"重複的教材 ID：{item['id']}")
    seen.add(item["id"])
    for key in ("path", "textPath"):
        if key not in item:
            continue
        target = (ROOT / item[key]).resolve()
        if not target.is_relative_to(ROOT) or not target.exists():
            raise SystemExit(f"教材檔案不存在或路徑不合法：{item[key]}")
        if target.is_dir() and not (target / "index.html").is_file():
            raise SystemExit(f"教材資料夾缺少 index.html：{item[key]}")
sha = os.environ.get("GITHUB_SHA") or subprocess.check_output(
    ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
).strip()
version = {
    "commit": sha,
    "builtAt": datetime.now(timezone.utc).isoformat(),
    "catalogCount": len(catalog),
    "runId": os.environ.get("GITHUB_RUN_ID"),
}
(ROOT / "site-version.json").write_text(
    json.dumps(version, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(f"Ready to publish {sha[:7]}: {len(catalog)} teaching resources")
summary = os.environ.get("GITHUB_STEP_SUMMARY")
if summary:
    with open(summary, "a", encoding="utf-8") as report:
        report.write(f"## 五島網站發布資料\n\n- 版本：`{sha}`\n- 教材索引：{len(catalog)} 份\n- 發布完成後：[開啟網站](https://qqnice.github.io/) · [老師更新室](https://qqnice.github.io/manage/)\n")
