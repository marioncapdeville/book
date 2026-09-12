#!/usr/bin/env python3
import random
import re
from pathlib import Path

PROJECTS_DIR = Path("/Users/marioncapdeville/Documents/brief-book/src/projects")

files = sorted(PROJECTS_DIR.glob("*.md"))
random.seed(42)
random.shuffle(files)

for i, f in enumerate(files, start=1):
    text = f.read_text(encoding="utf-8")
    new_text, n = re.subn(r"^order: \d+$", f"order: {i}", text, flags=re.MULTILINE)
    if n != 1:
        print(f"!! WARNING: 'order:' not found/replaced cleanly in {f.name} (matches={n})")
    f.write_text(new_text, encoding="utf-8")
    print(f"{i:>3}  {f.name}")
