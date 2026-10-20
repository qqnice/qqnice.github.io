#!/usr/bin/env python3
"""Extract formal abstracts or clearly labelled fallback excerpts from TPR PDFs."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
from dataclasses import asdict, dataclass
from pathlib import Path

import pypdfium2 as pdfium


FORMAL_ABSTRACT_RE = re.compile(
    r"^(?:(?:[(（]?[一二三四五六七八九十0-9]+[)）、.．]?|"
    r"[一二三四五六七八九十0-9]+(?:[.．]\d+)+[.．]?)\s*)?"
    r"(?P<label>(?:(?:中文|研究|成果|計畫)?\s*摘\s*要|Abstract))"
    r"(?:\s*\([^)]*\))?\s*[:：]?\s*(?P<rest>.*)$",
    re.IGNORECASE,
)
PURPOSE_RE = re.compile(
    r"^(?:(?:[(（]?[一二三四五六七八九十壹貳參肆伍陸柒捌玖拾0-9]+"
    r"[)）、.．]?|[一二三四五六七八九十壹貳參肆伍陸柒捌玖拾0-9]+"
    r"(?:[.．]\d+)+[.．]?)\s*)?"
    r"(?P<label>研究(?:背景與)?動機(?:與目的)?|研究目的|"
    r"Research Motive and Purpose|Research Purpose)"
    r"(?:\s*\([^)]*\))?\s*[:：]?\s*(?P<rest>.*)$",
    re.IGNORECASE,
)
RESULT_RE = re.compile(
    r"^(?:(?:[(（]?[一二三四五六七八九十壹貳參肆伍陸柒捌玖拾0-9]+"
    r"[)）、.．]?|[一二三四五六七八九十壹貳參肆伍陸柒捌玖拾0-9]+"
    r"(?:[.．]\d+)+[.．]?)\s*)?"
    r"(?P<label>教學暨研究成果|教學與研究成果|"
    r"研究結果(?:與討論)?|結果與討論|研究成果|教學成果|成效分析|"
    r"結論(?:與建議)?|結語|Teaching and Research Outcomes|Research Outcomes|"
    r"Results(?: and Discussion)?|Conclusions?(?: and Recommendations)?)"
    r"(?:\s*\([^)]*\))?\s*[:：]?\s*(?P<rest>.*)$",
    re.IGNORECASE,
)
QUESTION_RE = re.compile(
    r"^(?:(?:[(（]?[一二三四五六七八九十壹貳參肆伍陸柒捌玖拾0-9]+"
    r"[)）、.．]?|[一二三四五六七八九十壹貳參肆伍陸柒捌玖拾0-9]+"
    r"(?:[.．]\d+)+[.．]?)\s*)?(?P<label>研究問題|Research Questions?)"
    r"(?:\s*\([^)]*\))?\s*[:：]?\s*(?P<rest>.*)$",
    re.IGNORECASE,
)
KEYWORDS_RE = re.compile(r"^(?:關鍵詞|關鍵字|Keywords?)\s*[:：]\s*(.*)$", re.I)

HEADING_WORDS = (
    "本文",
    "研究動機",
    "研究目的",
    "研究問題",
    "文獻探討",
    "教學設計",
    "研究設計",
    "研究方法",
    "資料分析",
    "教學暨研究成果",
    "教學與研究成果",
    "研究結果",
    "結果與討論",
    "研究成果",
    "教學成果",
    "成效分析",
    "結論",
    "結語",
    "建議",
    "參考文獻",
    "附件",
    "附錄",
    "Abstract",
    "Research Motive and Purpose",
    "Research Purpose",
    "Research Question",
    "Teaching and Research Outcomes",
    "Research Outcomes",
    "Results",
    "Conclusion",
    "AI 使用聲明",
)


@dataclass
class Section:
    heading: str = ""
    text: str = ""
    page: int = 0


@dataclass
class AbstractRecord:
    number: int
    year: str
    discipline: str
    period: str
    school: str
    department: str
    author: str
    position: str
    project: str
    extraction_status: str
    abstract: str
    abstract_page: int | None
    keywords: str
    purpose_excerpt: str
    purpose_page: int | None
    result_excerpt: str
    result_page: int | None
    abstract_characters: int
    pdf_file: str
    source_url: str
    note: str


def clean_line(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = value.replace("\u200b", "").replace("\ufeff", "")
    return " ".join(value.split()).strip()


def is_noise_line(line: str) -> bool:
    return bool(
        not line
        or re.fullmatch(r"[-–—_．。.·•\s]+", line)
        or re.fullmatch(r"(?:第\s*)?\d+(?:\s*頁)?", line)
    )


def is_section_heading(line: str) -> bool:
    if not line or len(line) > 100:
        return False
    compact = re.sub(r"\s+", "", line)
    if FORMAL_ABSTRACT_RE.match(line) or KEYWORDS_RE.match(line):
        return True
    if re.match(
        r"^(?:第[一二三四五六七八九十0-9]+[章節]|"
        r"[(（][壹貳參肆伍陸柒捌玖拾一二三四五六七八九十0-9]+[)）]|"
        r"[壹貳參肆伍陸柒捌玖拾一二三四五六七八九十0-9]+"
        r"(?:[.．]\d+)+[.．]?\s*|"
        r"[壹貳參肆伍陸柒捌玖拾一二三四五六七八九十]+、|"
        r"\d+(?:\.\d+)*[.、．)]\s*)",
        line,
    ):
        return True
    return any(
        compact.lower().startswith(word.replace(" ", "").lower())
        for word in HEADING_WORDS
    )


def join_lines(lines: list[str]) -> str:
    result = ""
    for line in lines:
        line = clean_line(line)
        if is_noise_line(line):
            continue
        if not result:
            result = line
        elif re.search(r"[A-Za-z0-9)]$", result) and re.match(r"^[A-Za-z0-9(]", line):
            result += " " + line
        else:
            result += line
    result = re.sub(r"\s+([，。；：、！？）])", r"\1", result)
    result = re.sub(r"([（])\s+", r"\1", result)
    return result.strip()


def trim_excerpt(text: str, limit: int = 900) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    window = text[:limit]
    sentence_end = max(window.rfind(mark) for mark in "。！？；")
    if sentence_end >= int(limit * 0.65):
        return window[: sentence_end + 1]
    return window.rstrip() + "…"


def extract_pdf_lines(path: Path) -> list[tuple[int, str]]:
    document = pdfium.PdfDocument(str(path))
    lines: list[tuple[int, str]] = []
    for page_index in range(len(document)):
        page = document[page_index]
        text_page = page.get_textpage()
        text = text_page.get_text_range()
        for raw_line in text.splitlines():
            line = clean_line(raw_line)
            if not is_noise_line(line):
                lines.append((page_index + 1, line))
        text_page.close()
        page.close()
    document.close()
    return lines


def section_candidates(
    lines: list[tuple[int, str]],
    heading_pattern: re.Pattern[str],
    *,
    max_chars: int = 5000,
    allow_leading_subheadings: int = 0,
) -> list[Section]:
    candidates: list[Section] = []
    for index, (page, line) in enumerate(lines):
        match = heading_pattern.match(line)
        if not match:
            continue
        body_lines: list[str] = []
        rest = clean_line(match.groupdict().get("rest") or "")
        if rest:
            body_lines.append(rest)
        skipped_subheadings = 0
        for _, next_line in lines[index + 1 :]:
            if KEYWORDS_RE.match(next_line):
                break
            if is_section_heading(next_line):
                if not body_lines and skipped_subheadings < allow_leading_subheadings:
                    skipped_subheadings += 1
                    continue
                break
            body_lines.append(next_line)
            if len("".join(body_lines)) >= max_chars:
                break
        body = join_lines(body_lines)
        if body:
            candidates.append(
                Section(
                    heading=clean_line(match.groupdict().get("label") or line),
                    text=body[:max_chars],
                    page=page,
                )
            )
    return candidates


def choose_section(candidates: list[Section], minimum: int = 80) -> Section:
    valid = [candidate for candidate in candidates if len(candidate.text) >= minimum]
    if not valid:
        return Section()
    return max(valid, key=lambda candidate: len(candidate.text))


def extract_keywords(lines: list[tuple[int, str]], abstract_page: int) -> str:
    for page, line in lines:
        if abstract_page and abs(page - abstract_page) > 2:
            continue
        match = KEYWORDS_RE.match(line)
        if match and match.group(1).strip():
            return trim_excerpt(clean_line(match.group(1)), 300)
    return ""


def build_record(source: dict[str, str]) -> AbstractRecord:
    pdf_path = Path(source["local_file"])
    lines = extract_pdf_lines(pdf_path)
    proposal_warning = any(
        "計畫申請內容" in line or "Project Proposal" in line
        for _, line in lines[:40]
    )

    formal = choose_section(section_candidates(lines, FORMAL_ABSTRACT_RE), minimum=120)
    purpose = choose_section(
        section_candidates(lines, PURPOSE_RE, allow_leading_subheadings=1), minimum=80
    )
    result = choose_section(
        section_candidates(lines, RESULT_RE, allow_leading_subheadings=2), minimum=50
    )
    if not result.text:
        result = choose_section(
            section_candidates(lines, QUESTION_RE, allow_leading_subheadings=1), minimum=80
        )

    purpose_text = trim_excerpt(purpose.text)
    result_text = trim_excerpt(result.text)
    keywords = extract_keywords(lines, formal.page)

    if formal.text:
        abstract = trim_excerpt(formal.text, 3000)
        status = "正式摘要"
        abstract_page: int | None = formal.page
        note = "依 PDF 中明確的摘要標題擷取。"
    elif purpose_text and result_text:
        abstract = f"【研究目的摘錄】{purpose_text}\n\n【研究結果摘錄】{result_text}"
        status = "替代摘錄：研究目的＋結果"
        abstract_page = purpose.page
        note = "PDF 無正式摘要；此欄組合已標示的研究目的與研究結果段落，未進行改寫。"
    elif purpose_text:
        abstract = f"【研究目的摘錄】{purpose_text}"
        status = "替代摘錄：僅研究目的"
        abstract_page = purpose.page
        note = "PDF 無正式摘要且未辨識到結果段落；未進行改寫。"
    elif result_text:
        abstract = f"【研究結果摘錄】{result_text}"
        status = "替代摘錄：僅研究結果"
        abstract_page = result.page
        note = "PDF 無正式摘要且未辨識到目的段落；未進行改寫。"
    else:
        abstract = ""
        status = "無法擷取"
        abstract_page = None
        note = "PDF 文字層中未辨識到正式摘要、研究目的或結果段落。"

    if proposal_warning:
        note += " 注意：此 PDF 封面標示為計畫申請內容，可能不是成果報告。"

    return AbstractRecord(
        number=int(source["number"]),
        year=source["year"],
        discipline=source["discipline"],
        period=source["period"],
        school=source["school"],
        department=source["department"],
        author=source["author"],
        position=source["position"],
        project=source["project"],
        extraction_status=status,
        abstract=abstract,
        abstract_page=abstract_page,
        keywords=keywords,
        purpose_excerpt=purpose_text,
        purpose_page=purpose.page or None,
        result_excerpt=result_text,
        result_page=result.page or None,
        abstract_characters=len(abstract),
        pdf_file=str(pdf_path.resolve()),
        source_url=source["source_url"],
        note=note,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="擷取教學實踐研究成果報告摘要")
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("tpr_工程學門_113-114/成果清單.csv"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("tmp/pdfs/tpr_工程學門_113-114_摘要擷取.json"),
    )
    parser.add_argument("--limit", type=int, default=0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    with args.manifest.open("r", encoding="utf-8-sig", newline="") as handle:
        sources = [row for row in csv.DictReader(handle) if row.get("local_file")]
    sources = sources[: args.limit or None]
    args.output.parent.mkdir(parents=True, exist_ok=True)

    records: list[AbstractRecord] = []
    failures = 0
    for index, source in enumerate(sources, start=1):
        try:
            record = build_record(source)
        except Exception as exc:
            failures += 1
            record = AbstractRecord(
                number=int(source["number"]),
                year=source["year"],
                discipline=source["discipline"],
                period=source["period"],
                school=source["school"],
                department=source["department"],
                author=source["author"],
                position=source["position"],
                project=source["project"],
                extraction_status="讀取失敗",
                abstract="",
                abstract_page=None,
                keywords="",
                purpose_excerpt="",
                purpose_page=None,
                result_excerpt="",
                result_page=None,
                abstract_characters=0,
                pdf_file=source["local_file"],
                source_url=source["source_url"],
                note=f"{type(exc).__name__}: {exc}",
            )
        records.append(record)
        if index % 10 == 0 or index == len(sources):
            args.output.write_text(
                json.dumps([asdict(item) for item in records], ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            print(f"進度 {index}/{len(sources)}", flush=True)

    counts: dict[str, int] = {}
    for record in records:
        counts[record.extraction_status] = counts.get(record.extraction_status, 0) + 1
    print(json.dumps({"total": len(records), "failed": failures, "status": counts}, ensure_ascii=False))
    print(args.output.resolve())
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
