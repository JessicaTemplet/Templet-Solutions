#!/usr/bin/env python3
"""
apply-templates.py
Phase 1.4 – Standardize page structure for Templet Solutions

This script:
  • Reads template-standard.html and template-article.html from repo root
  • Scans /about, /articles, /articles-add-schema, /legal, /services-prices
  • Replaces inconsistent structure while preserving <main> content
  • Skips index.html
  • Creates a mirrored backup in /backup-phase1 before changes
"""

import os
import shutil
from bs4 import BeautifulSoup
from datetime import datetime

SCRIPT_NAME = "apply-templates.py"
# === CONFIG ===
ROOT_DIR = os.getcwd()
BACKUP_DIR = os.path.join(ROOT_DIR, "backup-phase1")
STANDARD_TEMPLATE_PATH = os.path.join(ROOT_DIR, "template-standard.html")
ARTICLE_TEMPLATE_PATH = os.path.join(ROOT_DIR, "template-article.html")

TARGET_FOLDERS = [
    "about",
    "articles",
    "articles-add-schema",
    "legal",
    "services-prices"
]

SKIP_FILES = {"index.html"}
ENCODING = "utf-8"

# === LOAD TEMPLATES ===
with open(STANDARD_TEMPLATE_PATH, "r", encoding=ENCODING) as f:
    standard_template = f.read()
with open(ARTICLE_TEMPLATE_PATH, "r", encoding=ENCODING) as f:
    article_template = f.read()

def ensure_backup_path(path):
    dest_path = os.path.join(BACKUP_DIR, os.path.relpath(path, ROOT_DIR))
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    shutil.copy2(path, dest_path)

def choose_template(filepath):
    lower = filepath.lower()
    if "articles-add-schema" in lower or os.sep + "articles" + os.sep in lower:
        return article_template, "template-article.html"
    return standard_template, "template-standard.html"

def extract_main_content(html_text):
    soup = BeautifulSoup(html_text, "html.parser")
    main = soup.find("main")
    return str(main) if main else None

def headers_footers_match(html_text, template_text):
    def clean_segment(segment):
        return segment.replace(" ", "").replace("\n", "")
    s_html, t_html = BeautifulSoup(html_text, "html.parser"), BeautifulSoup(template_text, "html.parser")
    return (
        clean_segment(str(s_html.find("header"))) == clean_segment(str(t_html.find("header")))
        and clean_segment(str(s_html.find("footer"))) == clean_segment(str(t_html.find("footer")))
    )

updated, skipped, unchanged = 0, 0, 0
start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"\n--- {SCRIPT_NAME} started at {start_time} ---")

for folder in TARGET_FOLDERS:
    folder_path = os.path.join(ROOT_DIR, folder)
    if not os.path.exists(folder_path):
        continue

    for root, _, files in os.walk(folder_path):
        for file in files:
            if not file.endswith(".html") or file in SKIP_FILES:
                continue

            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, ROOT_DIR)

            try:
                with open(file_path, "r", encoding=ENCODING) as f:
                    original_html = f.read()

                template_text, template_name = choose_template(file_path)
                if headers_footers_match(original_html, template_text):
                    print(f"Unchanged: {rel_path}")
                    unchanged += 1
                    continue

                main_content = extract_main_content(original_html)
                if not main_content:
                    main_content = "<main>\n<!-- No main content found -->\n</main>"

                ensure_backup_path(file_path)
                new_html = template_text.replace(
                    "<!-- ===================== PAGE-SPECIFIC CONTENT START ===================== -->",
                    main_content
                )

                with open(file_path, "w", encoding=ENCODING) as f:
                    f.write(new_html)

                print(f"Updated {rel_path} using {template_name}")
                updated += 1

            except Exception as e:
                print(f"Warning: Failed on {rel_path} — {e}")
                skipped += 1

total = updated + unchanged + skipped
end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"\n--- {SCRIPT_NAME} complete at {end_time} ---")
print(f"Processed: {total} files total")
print(f"Updated: {updated}")
print(f"Unchanged: {unchanged}")
print(f"Warnings/Skipped: {skipped}")
