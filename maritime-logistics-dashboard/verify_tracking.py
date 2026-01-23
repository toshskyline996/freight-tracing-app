from playwright.sync_api import sync_playwright, expect
import time
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 2000}) # Increase viewport height
        page = context.new_page()

        try:
            # Navigate to the local server
            page.goto("http://localhost:5173")

            # Wait for the page to load
            expect(page.get_by_text("Global Dashboard")).to_be_visible(timeout=10000)

            # Click on 'Live Tracking' link
            page.click("#live-tracking-link")

            # Wait for filter buttons to appear
            page.wait_for_selector(".filter-btn", state="visible", timeout=10000)

            # Verify the text of the buttons
            sea_btn = page.locator(".filter-btn[data-type='sea']")
            expect(sea_btn).to_contain_text("Sea (3)")

            # Scroll to the buttons (they are inside a section, but scrolling to bottom should work)
            sea_btn.scroll_into_view_if_needed()

            # Create verification directory
            os.makedirs("/home/jules/verification", exist_ok=True)

            # Take screenshot of the filter section area
            screenshot_path = "/home/jules/verification/live_tracking_buttons.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Verification failed: {e}")
            try:
                page.screenshot(path="/home/jules/verification/error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
