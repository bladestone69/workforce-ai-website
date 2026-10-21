"""Capture first-screen previews of public client sites for the Websites page."""

from pathlib import Path
from playwright.sync_api import sync_playwright


OUTPUT = Path(__file__).resolve().parents[1] / "images" / "client-sites"
OUTPUT.mkdir(parents=True, exist_ok=True)

SITES = {
    "veronica-snacks": "https://veronica-snacks.vercel.app/",
    "sky-printing": "https://sky-printing.vercel.app/",
    "fairbairn-consult": "https://fairbairn-consult.vercel.app/",
}

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, reduced_motion="reduce")
    for name, url in SITES.items():
        page = context.new_page()
        response = page.goto(url, wait_until="domcontentloaded", timeout=30000)
        if not response or response.status != 200:
            raise RuntimeError(f"{url} returned {response.status if response else 'no response'}")
        page.wait_for_timeout(6500 if name == "sky-printing" else 2200)
        path = OUTPUT / f"{name}.png"
        page.screenshot(path=str(path), full_page=False, animations="disabled")
        print(f"{name}: {response.status} {page.title()} -> {path}")
        page.close()
    browser.close()
