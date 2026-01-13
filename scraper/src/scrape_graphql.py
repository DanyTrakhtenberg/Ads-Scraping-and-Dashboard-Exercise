"""
Enhanced scraper that captures GraphQL responses and extracts ad data
"""
import os
import json
import time
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from graphql_parser import parse_graphql_responses

load_dotenv()

ADS_LIBRARY_URL = os.getenv("ADS_LIBRARY_URL") or "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=15087023444"

OUTPUT_FILE = "scraped_ads.json"
GRAPHQL_RESPONSES_FILE = "graphql_responses.json"

def run_scraper():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        # List to collect GraphQL responses
        captured_responses = []
        
        def handle_response(response):
            try:
                url = response.url
                # Capture GraphQL responses
                if "/api/graphql/" in url:
                    try:
                        body = response.body()
                        if body:
                            data = json.loads(body.decode('utf-8', errors='ignore'))
                            captured_responses.append({
                                "url": url,
                                "data": data
                            })
                            print(f"[CAPTURED] GraphQL response")
                    except:
                        pass
            except:
                pass
        
        page.on("response", handle_response)
        
        print(f"Opening Ads Library: {ADS_LIBRARY_URL}")
        page.goto(ADS_LIBRARY_URL, timeout=120000, wait_until="networkidle")
        
        print("Waiting for initial load...")
        time.sleep(5)
        
        # Scroll to load more ads (infinite scroll)
        print("Scrolling to load ads...")
        for i in range(15):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            if i % 3 == 0:
                print(f"Scrolled {i+1}/15 times...")
        
        print(f"\nCaptured {len(captured_responses)} GraphQL responses")
        
        # Save raw responses
        with open(GRAPHQL_RESPONSES_FILE, "w", encoding="utf-8") as f:
            json.dump(captured_responses, f, indent=2, ensure_ascii=False)
        print(f"Saved GraphQL responses to {GRAPHQL_RESPONSES_FILE}")
        
        # Parse GraphQL responses to extract ad data
        print("\nParsing GraphQL responses to extract ad data...")
        ads = parse_graphql_responses(captured_responses, max_ads=50)
        
        # Save results
        output_data = {
            "total_ads": len(ads),
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "ads": ads
        }
        
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nSuccessfully extracted {len(ads)} ads")
        print(f"Saved to {OUTPUT_FILE}")
        
        browser.close()

if __name__ == "__main__":
    run_scraper()
