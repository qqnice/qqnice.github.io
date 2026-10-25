"""Create repeatable D1 SQL from the site's public lesson catalog."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/islands/catalog.json"
OUTPUT = Path(__file__).with_name("catalog.sql")


def quote(value):
    return "'" + str(value).replace("'", "''") + "'"


lessons = json.loads(SOURCE.read_text(encoding="utf-8"))
lines = [
    "CREATE TABLE IF NOT EXISTS lesson_catalog (",
    "  id INTEGER PRIMARY KEY,",
    "  island TEXT NOT NULL,",
    "  topic TEXT NOT NULL,",
    "  payload TEXT NOT NULL",
    ");",
    "CREATE INDEX IF NOT EXISTS lesson_catalog_island_topic ON lesson_catalog (island, topic);",
    "INSERT OR REPLACE INTO lesson_catalog (id, island, topic, payload) VALUES",
]
rows = []
for lesson in lessons:
    payload = json.dumps(lesson, ensure_ascii=False, separators=(",", ":"))
    rows.append(
        f"  ({int(lesson['id'])}, {quote(lesson['island'])}, "
        f"{quote(lesson['topic'])}, {quote(payload)})"
    )
lines.append(",\n".join(rows) + ";")
OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Wrote {len(lessons)} lessons to {OUTPUT}")
