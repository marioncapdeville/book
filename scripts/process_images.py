#!/usr/bin/env python3
"""Resize/compress source photos from BOOK/ into src/images/uploads/<category>/<project>/
Uses macOS `sips` (no Node/ImageMagick needed). Converts everything to web-friendly JPEG.
"""
import subprocess
import sys
import unicodedata
import re
from pathlib import Path

MAX_DIM = 2000
JPEG_QUALITY = 82  # sips formatOptions: low/normal/high or 0-100 on newer macOS


def slugify(name: str) -> str:
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "-", name)
    name = re.sub(r"-+", "-", name).strip("-")
    return name


def process_folder(src_dir: Path, dest_dir: Path, exts=(".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP")):
    dest_dir.mkdir(parents=True, exist_ok=True)
    mapping = {}
    files = sorted([p for p in src_dir.iterdir() if p.is_file() and p.suffix in exts])
    for src in files:
        stem_slug = slugify(src.stem)
        out_name = f"{stem_slug}.jpg"
        out_path = dest_dir / out_name
        tmp_path = dest_dir / f"_tmp_{out_name}"
        # Convert + resize in one sips call
        cmd = [
            "sips",
            "-s", "format", "jpeg",
            "-s", "formatOptions", str(JPEG_QUALITY),
            "--resampleHeightWidthMax", str(MAX_DIM),
            str(src),
            "--out", str(tmp_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  !! FAILED: {src.name}\n{result.stderr}", file=sys.stderr)
            continue
        tmp_path.rename(out_path)
        orig_size = src.stat().st_size
        new_size = out_path.stat().st_size
        print(f"  {src.name} -> {out_name}  ({orig_size/1024/1024:.1f}MB -> {new_size/1024:.0f}KB)")
        mapping[src.name] = out_name
    return mapping


if __name__ == "__main__":
    src_dir = Path(sys.argv[1])
    dest_dir = Path(sys.argv[2])
    print(f"Processing {src_dir} -> {dest_dir}")
    mapping = process_folder(src_dir, dest_dir)
    print(f"Done: {len(mapping)} files")
