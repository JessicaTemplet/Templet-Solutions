#!/usr/bin/env python3
"""
inject-schema.py
Phase 1.5 – Insert meta & JSON-LD schema for Templet Solutions

- Scans: /about, /articles, /articles-add-schema, /legal, /services-prices, and index.html
- Removes existing JSON-LD <script type="application/ld+json"> blocks
- Inserts correct schema + breadcrumbs immediately after meta tags in <head>
- Fills meta description if missing/placeholder (from first paragraph)
- Fixes canonical to absolute URL
- Reads dates from visible byline when present; else uses today
- Creates backups in /backup-phase1.5/

Run:  python inject-schema.py
"""

import os
import re
import json
import shutil
from datetime import datetime
from bs4 import BeautifulSoup

# -----------------------------
# Config
# -----------------------------
ROOT = os.getcwd()
BACKUP_DIR = os.path.join(ROOT, "backup-phase1.5")
ENC = "utf-8"
BASE_URL = "https://www.templetsolutions.com"

TARGET_FOLDERS = [
    "about",
    "articles",
    "articles-add-schema",
    "legal",
    "services-prices",
]
ALSO_CHECK_INDEX = True  # include index.html at root

ORG = {
    "@id": "#organization",
    "@type": "Organization",
    "name": "Templet Solutions",
    "url": f"{BASE_URL}/index.html",
    "logo": f"{BASE_URL}/logo.png",
    "description": "AI Citation Optimization (AICO) and SEO digital marketing agency. We build your brand as a trusted source for AI chatbots and search systems."
}
AUTHOR = {
    "@id": "#jessica-templet",
    "@type": "Person",
    "name": "Jessica Templet",
    "url": f"{BASE_URL}/about/jessica-templet.html"
}
WEBSITE = {
    "@id": "#website",
    "@type": "WebSite",
    "name": "Templet Solutions",
    "url": f"{BASE_URL}/index.html",
    "publisher": {"@id": "#organization"}
}

PLACEHOLDER_DESC = "[ARTICLE DESCRIPTION HERE]"
MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
}

# -----------------------------
# Helpers
# -----------------------------
def ensure_backup(path):
    dst = os.path.join(BACKUP_DIR, os.path.relpath(path, ROOT))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(path, dst)

def rel_to_abs_url(rel_path):
    rel_path = rel_path.replace(os.sep, "/").lstrip("./")
    return f"{BASE_URL}/{rel_path}"

def is_article(filepath):
    low = filepath.lower()
    return ("/articles/" in low or "/articles-add-schema/" in low)

def is_about_org(filepath):
    return filepath.replace("\\", "/").endswith("about/about-us.html")

def is_about_person(filepath):
    return filepath.replace("\\", "/").endswith("about/jessica-templet.html")

def is_privacy(filepath):
    return filepath.replace("\\", "/").endswith("legal/privacy-policy.html")

def is_tos(filepath):
    low = filepath.lower().replace("\\", "/")
    return low.endswith("legal/tos.html") or low.endswith("legal/tos.htm") or low.endswith("legal/terms-of-service.html")

def is_index(filepath):
    return os.path.basename(filepath) == "index.html" and (os.path.dirname(filepath) == ROOT or os.path.dirname(filepath) == "")

def extract_title(soup):
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    h1 = soup.find("h1")
    return h1.get_text(strip=True) if h1 else "Templet Solutions"

def first_paragraph_text(soup):
    main = soup.find("main")
    if main:
        p = main.find("p")
        if p and p.get_text(strip=True):
            return p.get_text(strip=True)
    ac = soup.select_one(".article-content p")
    if ac and ac.get_text(strip=True):
        return ac.get_text(strip=True)
    p = soup.find("p")
    return p.get_text(strip=True) if p else ""

def summarize(text, max_len=160):
    t = re.sub(r"\s+", " ", text).strip()
    return (t[:max_len-1] + "…") if len(t) > max_len else t

def get_or_make_meta_desc(head, soup):
    meta = head.find("meta", attrs={"name": "description"})
    if meta and meta.get("content") and meta["content"].strip() and meta["content"].strip() != PLACEHOLDER_DESC:
        return meta
    desc_text = summarize(first_paragraph_text(soup)) or "High-authority AICO and SEO strategies from Templet Solutions."
    if meta:
        meta["content"] = desc_text
        return meta
    viewport = head.find("meta", attrs={"name": "viewport"})
    new_meta = soup.new_tag("meta")
    new_meta.attrs["name"] = "description"
    new_meta.attrs["content"] = desc_text
    if viewport:
        viewport.insert_after(new_meta)
    else:
        head.insert(0, new_meta)
    return new_meta

def set_canonical(head, soup, file_rel):
    link = head.find("link", rel="canonical")
    absu = rel_to_abs_url(file_rel)
    if link:
        link["href"] = absu
        return link
    new = soup.new_tag("link", rel="canonical", href=absu)
    head.append(new)
    return new

def parse_byline_dates(soup):
    pub_iso = None
    mod_iso = None
    section = soup.select_one("section.article-meta")
    if not section:
        return pub_iso, mod_iso

    text = section.get_text(" ", strip=True)
    def find_date(label):
        m = re.search(rf"{label}\s*:\s*([A-Za-z]+)\s+(\d{{1,2}}),\s*(\d{{4}})", text, flags=re.I)
        if not m:
            return None
        month, day, year = m.group(1).lower(), int(m.group(2)), int(m.group(3))
        mon = MONTHS.get(month)
        if not mon:
            return None
        return datetime(year, mon, day).date().isoformat()

    pub_iso = find_date("Date Published")
    mod_iso = find_date("Date Modified")
    return pub_iso, mod_iso

def first_image_url(soup):
    main = soup.find("main")
    if main:
        img = main.find("img")
        if img and img.get("src"):
            src = img["src"]
            return src if src.startswith("http") else f"{BASE_URL}/{src.lstrip('./')}"
    img = soup.find("img")
    if img and img.get("src"):
        src = img["src"]
        return src if src.startswith("http") else f"{BASE_URL}/{src.lstrip('./')}"
    return None

def remove_existing_jsonld(head):
    removed = 0
    for tag in list(head.find_all("script", attrs={"type": "application/ld+json"})):
        tag.decompose()
        removed += 1
    return removed

def breadcrumb_from_rel(rel_path, page_name):
    rel = rel_path.replace(os.sep, "/").lstrip("./")
    parts = rel.split("/")
    items = []
    items.append({
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": f"{BASE_URL}/index.html"
    })
    pos = 2
    if len(parts) > 1:
        folder = parts[0]
        folder_name = folder.replace("-", " ").title()
        mapping = {
            "about": "About",
            "articles": "Articles",
            "articles-add-schema": "Articles",
            "legal": "Legal",
            "services-prices": "Services & Pricing"
        }
        folder_name = mapping.get(folder, folder_name)
        folder_url = f"{BASE_URL}/{folder}/" if folder != "services-prices" else f"{BASE_URL}/services-prices/AI%20Citation%20Optimization%20Service%20Pricing.html"
        items.append({
            "@type": "ListItem",
            "position": pos,
            "name": folder_name,
            "item": folder_url
        })
        pos += 1

    items.append({
        "@type": "ListItem",
        "position": pos,
        "name": page_name,
        "item": rel_to_abs_url(rel)
    })
    return {
        "@type": "BreadcrumbList",
        "itemListElement": items
    }

def article_schema(title, desc, canonical, pub_iso, mod_iso, img_url):
    data = {
        "@context": "https://schema.org",
        "@graph": [
            ORG,
            WEBSITE,
            {
                "@type": "Article",
                "@id": "#article",
                "headline": title,
                "description": desc,
                "mainEntityOfPage": canonical,
                "author": {"@id": AUTHOR["@id"]},
                "publisher": {"@id": ORG["@id"]}
            },
            AUTHOR
        ]
    }
    if pub_iso: data["@graph"][2]["datePublished"] = pub_iso
    if mod_iso: data["@graph"][2]["dateModified"] = mod_iso
    if img_url: data["@graph"][2]["image"] = img_url
    return data

def about_org_schema(page_title, desc, canonical):
    return {
        "@context": "https://schema.org",
        "@graph": [
            ORG,
            WEBSITE,
            {
                "@type": "AboutPage",
                "@id": "#about",
                "name": page_title,
                "description": desc,
                "mainEntity": {"@id": ORG["@id"]},
                "url": canonical
            }
        ]
    }

def person_schema():
    return {
        "@context": "https://schema.org",
        **AUTHOR
    }

def website_org_schema():
    return {
        "@context": "https://schema.org",
        "@graph": [ORG, WEBSITE]
    }

def webpage_schema(page_title, desc, canonical, kind=None):
    dtype = "WebPage"
    if kind == "privacy":
        dtype = "PrivacyPolicy"
    elif kind == "tos":
        dtype = "TermsOfService"
    return {
        "@context": "https://schema.org",
        "@type": dtype,
        "name": page_title,
        "description": desc,
        "url": canonical
    }

def insert_after_meta(head, soup, json_objs):
    placeholder = None
    for el in head.children:
        if getattr(el, "string", None) and "SCHEMA PLACEHOLDER" in str(el):
            placeholder = el
            break

    def make_script(obj):
        tag = soup.new_tag("script", type="application/ld+json")
        tag.string = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
        return tag

    blocks = [make_script(o) for o in json_objs if o]

    if placeholder:
        placeholder.replace_with(blocks[0])
        anchor = blocks[0]
        for extra in blocks[1:]:
            anchor.insert_after(extra)
            anchor = extra
    else:
        metas_and_links = head.find_all(["meta", "link"])
        anchor = metas_and_links[-1] if metas_and_links else None
        if anchor:
            for blk in blocks:
                anchor.insert_after(blk)
                anchor = blk
        else:
            for blk in blocks:
                head.append(blk)

# -----------------------------
# Process
# -----------------------------
updated = 0
skipped = 0
start = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"--- inject-schema.py started at {start} ---")

def handle_file(file_path):
    global updated, skipped
    rel = os.path.relpath(file_path, ROOT).replace("\\", "/")
    try:
        with open(file_path, "r", encoding=ENC) as f:
            html = f.read()
        soup = BeautifulSoup(html, "html.parser")

        head = soup.find("head")
        if not head:
            print(f"Warning: No <head> in {rel}; skipping.")
            skipped += 1
            return

        # 1) Clean old JSON-LD
        removed = remove_existing_jsonld(head)

        # 1a) Remove any BlogPosting microdata
        for tag in soup.find_all(attrs={"itemscope": True}):
            if "itemtype" in tag.attrs and "BlogPosting" in tag["itemtype"]:
                del tag["itemtype"]
                del tag["itemscope"]

        # 2) Title (autofix placeholders)
        title = extract_title(soup)
        if not title or "ARTICLE TITLE HERE" in title or "[ARTICLE" in title:
            h1 = soup.find("h1")
            if h1 and h1.get_text(strip=True):
                title = h1.get_text(strip=True)
                if soup.title:
                    soup.title.string = f"{title} | Templet Solutions"

        # 3) Canonical
        set_canonical(head, soup, rel)
        canonical = head.find("link", rel="canonical")["href"]

        # 4) Description
        get_or_make_meta_desc(head, soup)
        desc = head.find("meta", attrs={"name": "description"})["content"]

        # 5) Breadcrumbs
        breadcrumbs = breadcrumb_from_rel(rel, page_name=title)

        # 6) Determine schema type
        json_blocks = []
        if is_article(rel):
            pub_iso, mod_iso = parse_byline_dates(soup)
            img_url = first_image_url(soup)
            json_blocks.append(article_schema(title, desc, canonical, pub_iso, mod_iso, img_url))
            json_blocks.append(breadcrumbs)
        elif is_about_org(rel):
            json_blocks.append(about_org_schema(title, desc, canonical))
            json_blocks.append(breadcrumbs)
        elif is_about_person(rel):
            json_blocks.append(person_schema())
            json_blocks.append(breadcrumbs)
        elif is_index(rel):
            json_blocks.append(website_org_schema())
        else:
            kind = "privacy" if is_privacy(rel) else ("tos" if is_tos(rel) else None)
            json_blocks.append(webpage_schema(title, desc, canonical, kind))
            json_blocks.append(breadcrumbs)

        # 7) Insert JSON-LD blocks
        insert_after_meta(head, soup, json_blocks)

        # 8) Save with backup
        ensure_backup(file_path)
        with open(file_path, "w", encoding=ENC) as f:
            f.write(str(soup))

        print(f"Updated {rel} (removed {removed} old JSON-LD)")
        updated += 1

    except Exception as e:
        print(f"Warning: Failed {rel} — {e}")
        skipped += 1

for folder in TARGET_FOLDERS:
    base = os.path.join(ROOT, folder)
    if not os.path.isdir(base):
        continue
    for r, _, files in os.walk(base):
        for name in files:
            if name.lower().endswith(".html"):
                handle_file(os.path.join(r, name))

if ALSO_CHECK_INDEX:
    idx = os.path.join(ROOT, "index.html")
    if os.path.exists(idx):
        handle_file(idx)

end = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"--- inject-schema.py complete at {end} ---")
print(f"Updated: {updated} | Warnings/Skipped: {skipped}")
