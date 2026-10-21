"""Smoke-test the local client-site showcase at desktop and mobile widths."""

from pathlib import Path
from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:4192/websites-apps.html#client-sites"
OUTPUT = Path(__file__).resolve().parents[1] / "tmp" / "client-sites-review"
OUTPUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width, height, name in [(1440, 900, "desktop"), (390, 844, "mobile")]:
        context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1)
        page = context.new_page()
        response = page.goto(BASE, wait_until="domcontentloaded")
        assert response and response.status == 200
        section = page.locator("[data-client-carousel]")
        section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        assert page.locator(".client-site.is-active h3").inner_text() == "Veronica's Snacks"
        assert page.locator(".client-site-image").count() == 3
        assert page.locator(".client-site-link[href^='https://']").count() == 3
        assert page.locator(".client-showcase > .client-site").nth(1).locator("h3").inner_text() == "Veronica's Snacks"
        section.screenshot(path=str(OUTPUT / f"{name}.png"), animations="disabled")
        if name == "desktop":
            page.locator(".client-showcase > .client-site").first.locator("[data-client-select]").click()
            assert page.locator(".client-showcase > .client-site").nth(1).locator("h3").inner_text() == "Sky Printing"
            assert page.locator(".client-showcase > .client-site").first.locator("h3").inner_text() == "Veronica's Snacks"
            page.locator(".client-showcase > .client-site").last.locator("[data-client-select]").click()
            assert page.locator(".client-showcase > .client-site").nth(1).locator("h3").inner_text() == "Erenst Meyer"
            assert page.locator(".client-showcase > .client-site").last.locator("h3").inner_text() == "Sky Printing"
        else:
            page.locator("[data-client-next]").click()
            assert page.locator(".client-showcase > .client-site").nth(1).locator("h3").inner_text() == "Erenst Meyer"
        assert page.locator("[data-client-count]").inner_text() == "03 / 03"
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
        print(f"{name}: page {response.status}, centre selection and side swap work, section height {round(section.bounding_box()['height'])}px, no horizontal overflow")
        context.close()
    browser.close()
