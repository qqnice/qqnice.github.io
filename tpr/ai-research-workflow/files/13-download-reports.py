#!/usr/bin/env python3
"""Download public TPR engineering reports and write a complete CSV manifest.

Defaults target ROC years 113-114 and the engineering discipline.  The script
uses only Python's standard library, downloads one file at a time, retries
transient failures, and skips files that are already present.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import math
import re
import ssl
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from html.parser import HTMLParser
from pathlib import Path


BASE_URL = "https://tpr.moe.edu.tw"
REPORT_DETAIL_URL = f"{BASE_URL}/achievement/reportDetail"
ENGINEERING_DOMAIN_ID = "402888097ce43d34017ce48679550007"
PAGE_SIZE = 50
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 TPR-Public-Report-Archiver/1.0"
)

# Python 3.13+ enables OpenSSL's strict verification flag by default.  The
# site's otherwise trusted certificate chain omits a Subject Key Identifier,
# which browsers and curl accept.  Clear only that strict flag while retaining
# CA verification and hostname checking.
TLS_CONTEXT = ssl.create_default_context()
if hasattr(ssl, "VERIFY_X509_STRICT"):
    TLS_CONTEXT.verify_flags &= ~ssl.VERIFY_X509_STRICT


@dataclass
class Report:
    number: int = 0
    year: str = ""
    discipline: str = ""
    period: str = ""
    school: str = ""
    department: str = ""
    author: str = ""
    position: str = ""
    project: str = ""
    availability: str = ""
    scheduled_open_date: str = ""
    source_url: str = ""
    local_file: str = ""
    file_size: int = 0
    error: str = ""


class ResultsParser(HTMLParser):
    """Extract result rows without external HTML parsing dependencies."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_tbody = False
        self.in_td = False
        self.current_cells: list[str] | None = None
        self.current_text: list[str] = []
        self.current_href = ""
        self.current_comments: list[str] = []
        self.reports: list[Report] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag == "tbody":
            self.in_tbody = True
        elif tag == "tr" and self.in_tbody:
            self.current_cells = []
            self.current_href = ""
            self.current_comments = []
        elif tag == "td" and self.current_cells is not None:
            self.in_td = True
            self.current_text = []
        elif tag == "a" and self.current_cells is not None:
            href = attrs_dict.get("href") or ""
            if "/achievement/reportFile/" in href:
                self.current_href = urllib.parse.urljoin(BASE_URL, href)

    def handle_data(self, data: str) -> None:
        if self.in_td:
            self.current_text.append(data)

    def handle_comment(self, data: str) -> None:
        if self.current_cells is not None:
            self.current_comments.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "td" and self.in_td and self.current_cells is not None:
            value = " ".join("".join(self.current_text).split())
            self.current_cells.append(html.unescape(value))
            self.current_text = []
            self.in_td = False
        elif tag == "tr" and self.current_cells is not None:
            cells = self.current_cells
            if len(cells) >= 9:
                open_date = ""
                comment = " ".join(self.current_comments)
                match = re.search(r"OpenDate>([^,]+)", comment)
                if match:
                    open_date = match.group(1).strip()
                self.reports.append(
                    Report(
                        year=cells[0],
                        discipline=cells[1],
                        period=cells[2],
                        school=cells[3],
                        department=cells[4],
                        author=cells[5],
                        position=cells[6],
                        project=cells[7],
                        availability="可下載" if self.current_href else cells[8],
                        scheduled_open_date=open_date,
                        source_url=self.current_href,
                    )
                )
            self.current_cells = None
            self.current_comments = []
        elif tag == "tbody":
            self.in_tbody = False


def request_bytes(
    url: str,
    *,
    data: bytes | None = None,
    retries: int = 3,
    timeout: int = 90,
) -> tuple[bytes, object]:
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            request = urllib.request.Request(
                url,
                data=data,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept-Encoding": "identity",
                },
            )
            with urllib.request.urlopen(
                request, timeout=timeout, context=TLS_CONTEXT
            ) as response:
                return response.read(), response.headers
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(attempt * 1.5)
    assert last_error is not None
    raise last_error


def fetch_page(start_year: int, end_year: int, page: int) -> tuple[list[Report], int]:
    payload = urllib.parse.urlencode(
        {
            "startYear": str(start_year),
            "endYear": str(end_year),
            "domainId": ENGINEERING_DOMAIN_ID,
            "yearPeriod": "",
            "schoolType": "",
            "schoolName": "",
            "keyword": "",
            "page": str(page),
        }
    ).encode("utf-8")
    body, headers = request_bytes(REPORT_DETAIL_URL, data=payload)
    charset = headers.get_content_charset() or "utf-8"
    document = body.decode(charset, errors="replace")
    total_match = re.search(r"查詢結果共\s*(\d+)\s*筆", document)
    if not total_match:
        raise RuntimeError(f"第 {page} 頁找不到結果筆數，網站版型可能已改變")
    parser = ResultsParser()
    parser.feed(document)
    return parser.reports, int(total_match.group(1))


def collect_reports(start_year: int, end_year: int) -> list[Report]:
    first_page, total = fetch_page(start_year, end_year, 1)
    reports = list(first_page)
    pages = math.ceil(total / PAGE_SIZE)
    print(f"找到 {total} 筆，共 {pages} 頁；正在建立清單…", flush=True)
    for page in range(2, pages + 1):
        page_reports, page_total = fetch_page(start_year, end_year, page)
        if page_total != total:
            raise RuntimeError("分頁期間結果筆數改變，請重新執行")
        reports.extend(page_reports)
        print(f"  清單頁 {page}/{pages}：{len(page_reports)} 筆", flush=True)
        time.sleep(0.15)
    if len(reports) != total:
        raise RuntimeError(f"預期 {total} 筆，但實際解析到 {len(reports)} 筆")
    for number, report in enumerate(reports, start=1):
        report.number = number
    return reports


def safe_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = re.sub(r'[\\/:*?"<>|\x00-\x1f]', "_", value)
    value = re.sub(r"\s+", " ", value).strip(" .")
    return value or "未命名"


def truncate_utf8(value: str, max_bytes: int) -> str:
    encoded = value.encode("utf-8")
    if len(encoded) <= max_bytes:
        return value
    encoded = encoded[:max_bytes]
    while True:
        try:
            return encoded.decode("utf-8").rstrip(" ._")
        except UnicodeDecodeError:
            encoded = encoded[:-1]


def report_filename(report: Report) -> str:
    file_id = report.source_url.rstrip("/").rsplit("/", 1)[-1][:8]
    stem = safe_text(
        f"{report.year}_{report.school}_{report.author}_{report.project}_{file_id}"
    )
    return f"{truncate_utf8(stem, 220)}.pdf"


def download_report(report: Report, files_dir: Path, overwrite: bool) -> str:
    destination = files_dir / report_filename(report)
    if destination.exists() and destination.stat().st_size > 0 and not overwrite:
        report.local_file = str(destination)
        report.file_size = destination.stat().st_size
        return "略過"

    body, headers = request_bytes(report.source_url)
    content_type = (headers.get("Content-Type") or "").lower()
    if "pdf" not in content_type and not body.startswith(b"%PDF"):
        raise RuntimeError(f"伺服器未回傳 PDF（Content-Type: {content_type or '未知'}）")

    temporary = destination.with_suffix(destination.suffix + ".part")
    temporary.write_bytes(body)
    temporary.replace(destination)
    report.local_file = str(destination)
    report.file_size = destination.stat().st_size
    return "完成"


def write_manifest(path: Path, reports: list[Report]) -> None:
    fields = list(asdict(Report()).keys())
    temporary = path.with_suffix(path.suffix + ".part")
    with temporary.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(asdict(report) for report in reports)
    temporary.replace(path)


def write_summary(path: Path, reports: list[Report]) -> None:
    summary = {
        "total": len(reports),
        "downloadable": sum(bool(report.source_url) for report in reports),
        "delayed": sum(not report.source_url for report in reports),
        "downloaded": sum(bool(report.local_file) for report in reports),
        "failed": sum(bool(report.error) for report in reports),
        "by_year": {},
    }
    for year in sorted({report.year for report in reports}):
        year_reports = [report for report in reports if report.year == year]
        summary["by_year"][year] = {
            "total": len(year_reports),
            "downloadable": sum(bool(report.source_url) for report in year_reports),
            "delayed": sum(not report.source_url for report in year_reports),
            "downloaded": sum(bool(report.local_file) for report in year_reports),
        }
    path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="批次下載教育部教學實踐研究計畫成果（工程學門）"
    )
    parser.add_argument("--start-year", type=int, default=113, help="起始民國年度")
    parser.add_argument("--end-year", type=int, default=114, help="結束民國年度")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("tpr_工程學門_113-114"),
        help="輸出資料夾",
    )
    parser.add_argument("--list-only", action="store_true", help="只建立清單，不下載 PDF")
    parser.add_argument("--overwrite", action="store_true", help="重新下載已存在的 PDF")
    parser.add_argument("--delay", type=float, default=0.25, help="每次下載後等待秒數")
    parser.add_argument("--limit", type=int, default=0, help="僅下載前 N 份（0 表示不限）")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.start_year > args.end_year:
        print("錯誤：起始年度不可大於結束年度", file=sys.stderr)
        return 2

    output_dir = args.output.expanduser().resolve()
    files_dir = output_dir / "PDF"
    output_dir.mkdir(parents=True, exist_ok=True)
    files_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = output_dir / "成果清單.csv"
    summary_path = output_dir / "摘要.json"

    reports = collect_reports(args.start_year, args.end_year)
    write_manifest(manifest_path, reports)

    downloadable = [report for report in reports if report.source_url]
    delayed = [report for report in reports if not report.source_url]
    print(
        f"清單完成：可下載 {len(downloadable)} 份，延後公開 {len(delayed)} 份。",
        flush=True,
    )
    if args.list_only:
        write_summary(summary_path, reports)
        print(f"已寫入：{manifest_path}")
        return 0

    targets = downloadable[: args.limit or None]
    failures = 0
    for index, report in enumerate(targets, start=1):
        try:
            result = download_report(report, files_dir, args.overwrite)
            size_mb = report.file_size / 1024 / 1024
            print(
                f"[{index:03d}/{len(targets):03d}] {result} "
                f"{report.year} {report.school} {report.author} ({size_mb:.1f} MB)",
                flush=True,
            )
        except Exception as exc:  # keep the batch moving and record the failure
            failures += 1
            report.error = f"{type(exc).__name__}: {exc}"
            print(
                f"[{index:03d}/{len(targets):03d}] 失敗 "
                f"{report.year} {report.school} {report.author}: {exc}",
                file=sys.stderr,
                flush=True,
            )
        if index % 10 == 0:
            write_manifest(manifest_path, reports)
            write_summary(summary_path, reports)
        time.sleep(max(args.delay, 0))

    write_manifest(manifest_path, reports)
    write_summary(summary_path, reports)
    print(f"\nPDF 資料夾：{files_dir}")
    print(f"成果清單：{manifest_path}")
    print(f"摘要：{summary_path}")
    print(f"成功或已存在 {len(targets) - failures} 份；失敗 {failures} 份。")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
