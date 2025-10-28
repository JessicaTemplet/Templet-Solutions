#!/usr/bin/env python3
"""
apply-internal-links.py
------------------------------------------------------------
Phase 1.6 – Smart internal linking for Templet Solutions

• Uses detailed semantic map of all articles
• Links first natural occurrence of each keyword to its canonical URL
• Skips linking an article to itself
• Backs up originals to /backup-linking
• Writes human-readable log to linking-report.txt

Run:
    python apply-internal-links.py
"""

import os
import re
import shutil
from datetime import datetime
from bs4 import BeautifulSoup

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------
ROOT = os.getcwd()
BACKUP_DIR = os.path.join(ROOT, "backup-linking")
LOG_FILE = os.path.join(ROOT, "linking-report.txt")
ENC = "utf-8"

TARGET_FOLDERS = ["articles", "articles-add-schema"]

# =========================================================
# SEMANTIC MAP
# =========================================================
LINK_MAP = {
    "C⁴AT³ Framework: Next-Generation AI Citation Optimization": {
        "url": "/articles/C4AT3-part-1.html",
        "keywords": [
            "AI Citation Optimization", "AICO", "C4AT3 Framework", "Next-Generation SEO",
            "AI content evaluation", "content trust signals", "machine readability",
            "systematic content quality", "authority building", "AI content standards"
        ],
    },
    "The Complete Guide to Timeliness: Why AI Systems Cite Fresh Content": {
        "url": "/articles/content-freshness.html",
        "keywords": [
            "Timeliness", "Fresh Content", "Content Decay Curve", "Content Recency",
            "Content update frequency", "temporal signals", "September Cliff",
            "content maintenance strategy", "dateModified", "recency bias", "evergreen content strategy"
        ],
    },
    "The Complete Guide to Credibility: Why AI Systems Cite Verifiable Content": {
        "url": "/articles/complete-guide-to-credibility.html",
        "keywords": [
            "Credibility", "Verifiable Content", "Trust Signals", "Authoritativeness",
            "Author expertise", "E-E-A-T", "citation provenance", "source validation",
            "author bio parsing", "institutional rigor"
        ],
    },
    "The Complete Guide to Actionability: Why AI Systems Cite Practical Content": {
        "url": "/articles/complete-guide-to-actionability.html",
        "keywords": [
            "Actionability", "Practical Content", "User Success", "Implementable Guidance",
            "Step-by-step guidance", "troubleshooting", "measurable outcomes",
            "task completion", "working examples", "utility optimization", "how-to content"
        ],
    },
    "Technical Excellence: Maximizing Machine Readability for AI Citation": {
        "url": "/articles/technical-excellence.html",
        "keywords": [
            "Technical Excellence", "Machine Readability", "AI Crawlability", "Structured Data",
            "Semantic HTML5", "JSON-LD", "schema markup implementation",
            "page load speed", "mobile responsiveness", "HTTPS/SSL",
            "structured data parsing", "site performance"
        ],
    },
    "Prompt Engineering for SEO: Getting ChatGPT, Claude, Perplexity, and Gemini to A+": {
        "url": "/articles/prompt-engineering.html",
        "keywords": [
            "Prompt Engineering", "AI Search Optimization", "LLM SEO",
            "Generative AI querying", "large language model", "AI output quality",
            "synthetic content generation", "AI workflow optimization",
            "ChatGPT", "Claude", "Gemini"
        ],
    },
    "Complete Guide to SERPs and AI SERPs": {
        "url": "/articles/complete-guide-to-serp.html",
        "keywords": [
            "AI SERP", "Search Engine Results Page", "Traditional SERP", "Google SGE",
            "Generative Experience", "featured snippets", "People Also Ask", "PAA",
            "organic results", "search result evolution", "zero-click search",
            "search results page", "answer box optimization"
        ],
    },
    "Writing Headlines and Headers That AI Systems Love to Cite": {
        "url": "/articles/writing-headlines-and-headers.html",
        "keywords": [
            "AI-Citable Headlines", "Header Tag Strategy", "H1", "H2 Optimization",
            "Content summary tags", "intent matching", "title tag best practices",
            "click-through rate", "CTR", "semantic signaling", "topic definition",
            "query-to-headline relevance"
        ],
    },
    "Voice Search Optimization (VSO)": {
        "url": "/articles/voice-search-optimization.html",
        "keywords": [
            "Voice Search Optimization", "VSO", "Voice Search Strategy",
            "Conversational search", "natural language queries", "long-tail keywords",
            "spoken language patterns", "mobile optimization", "Q&A format",
            "featured snippet targeting"
        ],
    },
    "The TEACH Framework: Building Authority Through Knowledge Sharing": {
        "url": "/articles/authority-building-teach-framework.html",
        "keywords": [
            "Authority Building", "TEACH Framework", "Topical Authority",
            "Content clusters", "knowledge hubs", "entity mapping",
            "thought leadership", "internal linking structure",
            "expert consensus", "site architecture"
        ],
    },
    "AI Citation-Worthy Content: Assess & Fix Your Content Before You Optimize": {
        "url": "/articles/ai-content-analysis.html",
        "keywords": [
            "Content Audit", "Content Assessment", "AI Quality Score",
            "Content Gaps", "Editorial guidelines", "quality control",
            "pre-optimization checklist", "trust signal evaluation",
            "content gap analysis", "AI readiness assessment"
        ],
    },
    "Complete Guide: Content Clusters (Hub and Spoke Strategy)": {
        "url": "/articles/complete-guide-content-clusters.html",
        "keywords": [
            "Content Clusters", "Hub and Spoke", "Pillar Page Strategy",
            "Knowledge graph architecture", "topical depth", "internal linking strategy",
            "SEO siloing", "subject matter completeness", "content mapping"
        ],
    },
}

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
def ensure_backup(path):
    dst = os.path.join(BACKUP_DIR, os.path.relpath(path, ROOT))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(path, dst)

def link_text_in_html(soup, keyword, target_url, log_lines):
    text_blocks = soup.find_all(string=re.compile(keyword, re.I))
    for t in text_blocks:
        if t.parent.name == "a":
            continue
        m = re.search(keyword, t, re.I)
        if not m:
            continue
        start, end = m.span()
        new_text = t[:start] + f'<a href="{target_url}">{t[start:end]}</a>' + t[end:]
        t.replace_with(BeautifulSoup(new_text, "html.parser"))
        log_lines.append(f"    Linked '{m.group(0)}' → {target_url}")
        return True
    return False

def process_file(filepath, log_lines):
    with open(filepath, "r", encoding=ENC) as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")

    main = soup.find("main") or soup.select_one(".article-content")
    if not main:
        return False

    rel_path = os.path.relpath(filepath, ROOT).replace("\\", "/")
    changed = False

    for article_title, data in LINK_MAP.items():
        target_url = data["url"]
        # --- Skip linking to itself ---
        if rel_path.endswith(os.path.basename(target_url)):
            continue

        for phrase in data["keywords"]:
            if link_text_in_html(main, phrase, target_url, log_lines):
                changed = True
                break  # one link per target article per page

    if changed:
        ensure_backup(filepath)
        with open(filepath, "w", encoding=ENC) as f:
            f.write(str(soup))
        return True
    return False

# ---------------------------------------------------------
# Main execution
# ---------------------------------------------------------
updated = 0
skipped = 0
start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
log_lines = [f"--- apply-internal-links.py started at {start_time} ---\n"]

for folder in TARGET_FOLDERS:
    base = os.path.join(ROOT, folder)
    if not os.path.isdir(base):
        continue
    for root, _, files in os.walk(base):
        for name in files:
            if not name.lower().endswith(".html"):
                continue
            file_path = os.path.join(root, name)
            rel_path = os.path.relpath(file_path, ROOT)
            log_lines.append(f"\nFile: {rel_path}")
            try:
                if process_file(file_path, log_lines):
                    log_lines.append("  → Updated")
                    updated += 1
                else:
                    log_lines.append("  → No matches found")
                    skipped += 1
            except Exception as e:
                log_lines.append(f"  ⚠️  Error: {e}")
                skipped += 1

end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
log_lines.append(f"\n--- apply-internal-links.py complete at {end_time} ---")
log_lines.append(f"Linked pages updated: {updated} | Skipped: {skipped}\n")

with open(LOG_FILE, "w", encoding=ENC) as f:
    f.write("\n".join(log_lines))

print(f"Script complete. Updated: {updated} | Skipped: {skipped}")
print(f"Full report written to: {LOG_FILE}")
