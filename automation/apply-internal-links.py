#!/usr/bin/env python3
"""
apply-internal-links.py
Phase 1.6 – Contextual internal linking for Templet Solutions

Now skips <title> and all header tags (h1–h6).
Only adds links inside paragraph, list, and span content nodes.
"""

import os
import re
from bs4 import BeautifulSoup

ROOT = os.getcwd()
ARTICLES_DIR = os.path.join(ROOT, "articles")
ENC = "utf-8"

# ==========================================================
# Link targets (anchor text → relative URL)
# ==========================================================
LINK_MAP = {
    "AI Citation Optimization": "/articles/C4AT3-part-1.html",
    "AICO": "/articles/C4AT3-part-1.html",
    "C4AT3 Framework": "/articles/C4AT3-part-1.html",
    "Timeliness": "/articles/content-freshness.html",
    "Fresh Content": "/articles/content-freshness.html",
    "Credibility": "/articles/complete-guide-to-credibility.html",
    "Actionability": "/articles/complete-guide-to-actionability.html",
    "Technical Excellence": "/articles/technical-excellence.html",
    "structured data": "/articles/technical-excellence.html",
    "ChatGPT": "/articles/prompt-engineering.html",
    "Claude": "/articles/prompt-engineering.html",
    "SERP": "/articles/complete-guide-to-serp.html",
    "Featured snippets": "/articles/complete-guide-to-serp.html",
    "CTR": "/articles/writing-headlines-and-headers.html",
    "H1": "/articles/writing-headlines-and-headers.html",
    "headlines": "/articles/writing-headlines-and-headers.html",
    "Mobile Optimization": "/articles/voice-search-optimization.html",
    "Voice Search": "/articles/voice-search-optimization.html",
    "content audit": "/articles/ai-content-analysis.html",
    "Editorial Guidelines": "/articles/ai-content-analysis.html",
    "Content Clusters": "/articles/complete-guide-content-clusters.html",
    "content clusters": "/articles/complete-guide-content-clusters.html",
    "topical authority": "/articles/authority-building-teach-framework.html",
    "thought leadership": "/articles/authority-building-teach-framework.html",
    "TEACH Framework": "/articles/authority-building-teach-framework.html"
}

# ==========================================================
# Helpers
# ==========================================================

def should_skip_tag(tag):
    """Skip linking inside titles or headings."""
    if not tag.name:
        return False
    return tag.name in ["title", "h1", "h2", "h3", "h4", "h5", "h6"]

def apply_links_to_tag(tag, file_rel):
    """Applies links to paragraphs, list items, etc., avoiding headings."""
    updated = False
    skip_self_links = [v for v in LINK_MAP.values() if file_rel.endswith(v)]
    for child in tag.find_all(text=True):
        parent = child.parent
        if should_skip_tag(parent):
            continue
        text = str(child)
        new_text = text
        for phrase, link in LINK_MAP.items():
            if any(skip in file_rel for skip in [link]):
                continue  # skip linking to itself
            pattern = r"\b(" + re.escape(phrase) + r")\b"
            new_text = re.sub(
                pattern,
                rf'<a href="{link}">\1</a>',
                new_text,
                flags=re.IGNORECASE
            )
        if new_text != text:
            new_node = BeautifulSoup(new_text, "html.parser")
            child.replace_with(new_node)
            updated = True
    return updated

# ==========================================================
# Main process
# ==========================================================
report = []
updated = 0
skipped = 0

print(f"--- apply-internal-links.py started ---\n")

for root, _, files in os.walk(ARTICLES_DIR):
    for name in files:
        if not name.lower().endswith(".html"):
            continue

        file_path = os.path.join(root, name)
        rel_path = os.path.relpath(file_path, ROOT).replace("\\", "/")

        try:
            with open(file_path, "r", encoding=ENC) as f:
                html = f.read()

            soup = BeautifulSoup(html, "html.parser")
            main = soup.find("main") or soup.body
            if not main:
                skipped += 1
                report.append(f"File: {rel_path}\n  → No <main> or <body> found\n")
                continue

            changed = apply_links_to_tag(main, rel_path)

            if changed:
                with open(file_path, "w", encoding=ENC) as f:
                    f.write(str(soup))
                updated += 1
                report.append(f"File: {rel_path}\n  → Updated\n")
            else:
                skipped += 1
                report.append(f"File: {rel_path}\n  → No matches found\n")

        except Exception as e:
            report.append(f"File: {rel_path}\n  → Error: {e}\n")
            skipped += 1

print(f"Script complete. Updated: {updated} | Skipped: {skipped}")
report_path = os.path.join(ROOT, "linking-report.txt")
with open(report_path, "w", encoding=ENC) as r:
    r.write("\n".join(report))
print(f"Full report written to: {report_path}")
