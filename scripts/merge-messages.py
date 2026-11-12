#!/usr/bin/env python3
"""
Merges translation sections into messages/{pl,en,de,uk}.json.

Usage: python3 scripts/merge-messages.py fragment.json

`fragment.json` is {"pl": {"section": {...}}, "en": {...}, "de": {...}, "uk": {...}}.
Each top-level section replaces the same section in that language's file;
other sections are left alone. A lock file serialises writers, because
several people (and sessions) add sections to the same files.
"""
import fcntl
import json
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "messages")
LANGS = ["pl", "en", "de", "uk"]

fragment = json.load(open(sys.argv[1], encoding="utf-8"))
missing = [lang for lang in LANGS if lang not in fragment]
if missing:
    sys.exit(f"fragment lacks languages: {missing}")
sections = set(fragment["pl"])
for lang in LANGS:
    if set(fragment[lang]) != sections:
        sys.exit(f"{lang} has sections {sorted(fragment[lang])}, pl has {sorted(sections)}")

with open(os.path.join(ROOT, ".lock"), "w") as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    for lang in LANGS:
        path = os.path.join(ROOT, f"{lang}.json")
        data = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
        data.update(fragment[lang])
        with open(path, "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False, indent=2)
            out.write("\n")
print("merged", sorted(sections))
