import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "products"
CATALOG = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "AppData" / "Local" / "Temp" / "freshcart-catalog.json"

OUT.mkdir(parents=True, exist_ok=True)
items = json.loads(CATALOG.read_text(encoding="utf-8"))["items"]


def is_valid_image(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 12000:
        return False
    try:
        with Image.open(path) as image:
            image.verify()
        return True
    except Exception:
        return False


def fetch(item: dict) -> str:
    slug = item["slug"]
    dest = OUT / f"{slug}.jpg"
    if is_valid_image(dest):
        return f"skip {slug}"

    prompt = urllib.parse.quote(
        f"ultra realistic studio grocery product photo of {item['name']}, "
        "isolated on a clean off-white background, soft shadow, bright e-commerce packshot, "
        "no watermark, no logo, no readable brand text"
    )
    url = f"https://image.pollinations.ai/prompt/{prompt}?width=768&height=768&nologo=true&model=flux"
    req = urllib.request.Request(url, headers={"User-Agent": "FreshCartImageBot/1.0"})
    last_error = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                dest.write_bytes(response.read())
            if is_valid_image(dest):
                return f"ok {slug} {dest.stat().st_size}"
            dest.unlink(missing_ok=True)
            last_error = "invalid image"
        except Exception as error:
            last_error = error
            time.sleep(2.5 * (attempt + 1))
    return f"fail {slug} {last_error}"


def main() -> None:
    missing = [item for item in items if not is_valid_image(OUT / f"{item['slug']}.jpg")]
    print(f"need {len(missing)} / {len(items)}", flush=True)
    for item in missing:
        print(fetch(item), flush=True)
        time.sleep(2.5)
    remaining = [item["slug"] for item in items if not is_valid_image(OUT / f"{item['slug']}.jpg")]
    print(f"remaining={len(remaining)} {remaining}", flush=True)


if __name__ == "__main__":
    main()
