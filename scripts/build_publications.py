#!/usr/bin/env python3
"""Regenerate the Publications section of index.html from publications.json.

Single source of truth: publications.json. This script rewrites everything
between the PUBLICATIONS:START/END markers and the hero article counter
between HERO-ARTICLES:START/END, then lints stale claims:
  - in_press older than 12 months since accepted_date -> BUILD FAILS
  - under_review older than 18 months since `since`    -> BUILD FAILS
So an "(in press)" can never silently rot on the site again.

Usage: python3 scripts/build_publications.py [--check]
  --check: verify index.html is up to date with the JSON (CI mode), no writes.
"""

from __future__ import annotations

import html
import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "publications.json"
HTML_PATH = ROOT / "index.html"

PUB_START = "<!-- PUBLICATIONS:START (generated from publications.json — do not edit by hand) -->"
PUB_END = "<!-- PUBLICATIONS:END -->"
HERO_START = "<!-- HERO-ARTICLES:START -->"
HERO_END = "<!-- HERO-ARTICLES:END -->"
CIT_START = "<!-- HERO-CITATIONS:START -->"
CIT_END = "<!-- HERO-CITATIONS:END -->"
HIDX_START = "<!-- HERO-HINDEX:START -->"
HIDX_END = "<!-- HERO-HINDEX:END -->"
METRICS_MAX_DAYS = 365  # metrics unchecked for >12 months fail the monthly lint

BOLD_SELF = re.compile(r"(Agiropoulos, C\.L\.|Agiropoulos, C\.)")

IN_PRESS_MAX_DAYS = 365
UNDER_REVIEW_MAX_DAYS = 548


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def render_entry(num: str, e: dict) -> str:
    authors = BOLD_SELF.sub(r"<strong>\1</strong>", esc(e["authors"]))
    detail = f", {esc(e['detail'])}" if e.get("detail") else ""
    status = e.get("status", "published")
    badge = ""
    if status == "in_press":
        badge = ' <span class="pub-badge">(in press)</span>'
    elif status == "under_review":
        badge = ' <span class="pub-badge">(under review)</span>'
    links = "".join(
        f' <a href="{html.escape(l["url"])}" target="_blank" rel="noopener">{esc(l["label"])}</a>.'
        for l in e.get("links", [])
    )
    return (
        f'      <div class="pub-item">\n'
        f'        <div class="pub-num">{num}</div>\n'
        f'        <div class="pub-text">{authors} ({e["year"]}). {esc(e["title"])}. '
        f'<em>{esc(e["venue"])}</em>{detail}.{badge}{links}</div>\n'
        f"      </div>"
    )


def render_category(title: str, entries: list[dict], count: int | None = None) -> str:
    n = count if count is not None else sum(e.get("count", 1) for e in entries)
    items = []
    num = 1
    for e in entries:
        c = e.get("count", 1)
        label = str(num) if c == 1 else f"{num}&ndash;{num + c - 1}"
        items.append(render_entry(label, e))
        num += c
    body = "\n".join(items)
    return (
        f'    <div class="pub-category">\n'
        f"      <h3>{title} <span>{n}</span></h3>\n{body}\n    </div>"
    )


def lint(data: dict, today: date) -> list[str]:
    errors = []
    m = data.get("metrics", {})
    if m:
        if "checked" not in m:
            errors.append("metrics without a checked date")
        elif (today - date.fromisoformat(m["checked"])).days > METRICS_MAX_DAYS:
            errors.append(f"citation metrics last checked {m['checked']} (>12 months) — "
                          f"re-check Google Scholar and update metrics.checked")
    for cat in ("articles", "working_papers", "book_chapters", "monographs"):
        for e in data.get(cat, []):
            status = e.get("status", "published")
            ref = f"{e['title'][:50]}… ({e['venue']})"
            if status == "in_press":
                if "accepted_date" not in e:
                    errors.append(f"in_press without accepted_date: {ref}")
                elif (today - date.fromisoformat(e["accepted_date"])).days > IN_PRESS_MAX_DAYS:
                    errors.append(f"in_press for >12 months — verify or update: {ref}")
            elif status == "under_review":
                if "since" not in e:
                    errors.append(f"under_review without since: {ref}")
                elif (today - date.fromisoformat(e["since"])).days > UNDER_REVIEW_MAX_DAYS:
                    errors.append(f"under_review for >18 months — verify or reclassify: {ref}")
    return errors


def build_section(data: dict) -> str:
    parts = [render_category("Peer-Reviewed Journal Articles", data["articles"])]
    if data.get("working_papers"):
        parts.append(render_category("Working Papers", data["working_papers"]))
    if data.get("book_chapters"):
        parts.append(render_category("Book Chapters", data["book_chapters"]))
    if data.get("monographs"):
        parts.append(render_category("Scientific Monograph", data["monographs"]))
    return "\n\n".join(parts)


def splice(text: str, start: str, end: str, replacement: str, label: str) -> str:
    i, j = text.find(start), text.find(end)
    if i == -1 or j == -1 or j < i:
        sys.exit(f"ERROR: {label} markers not found in index.html")
    return text[: i + len(start)] + "\n" + replacement + "\n" + text[j:]


def main() -> None:
    check = "--check" in sys.argv
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    errors = lint(data, datetime.now().date())
    if errors:
        print("PUBLICATION LINT FAILURES:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    html_text = HTML_PATH.read_text(encoding="utf-8")
    n_articles = str(len(data["articles"]))
    new = splice(html_text, PUB_START, PUB_END, build_section(data), "PUBLICATIONS")
    new = splice(new, HERO_START, HERO_END, n_articles, "HERO-ARTICLES")
    m = data.get("metrics", {})
    if m:
        new = splice(new, CIT_START, CIT_END, str(m["citations"]), "HERO-CITATIONS")
        new = splice(new, HIDX_START, HIDX_END, str(m["h_index"]), "HERO-HINDEX")

    if check:
        if new != html_text:
            sys.exit("index.html is out of date with publications.json — run scripts/build_publications.py")
        print("check OK: index.html matches publications.json")
        return
    if new != html_text:
        HTML_PATH.write_text(new, encoding="utf-8")
        print(f"rebuilt publications section ({n_articles} articles)")
    else:
        print("no changes")


if __name__ == "__main__":
    main()
