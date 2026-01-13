# Facebook Ads Library Data Mapping Guide

This document maps the data shown on the Facebook Ads Library page to the GraphQL response structure.

## Page Display → GraphQL Response Mapping

### Example Ad from Browser View:
- **Library ID**: 830501826490341 (shown on page as "Library ID: 830501826490341")
- **Status**: Active (green badge with checkmark)
- **Start Date**: "Started running on Jan 8, 2026"
- **Platforms**: Facebook and Instagram icons
- **Ad Copy**: "Ball's in your court. Get the gear that never misses."
- **Product Title**: "Nike Air Monarch IV"
- **Image**: Shoe image URL
- **Link**: "Shop Now" button → NIKE.COM

### GraphQL Response Structure:

```json
{
  "data": {
    "data": {
      "ad_library_main": {
        "search_results_connection": {
          "edges": [
            {
              "node": {
                "collated_results": [
                  {
                    "ad_archive_id": "25927973150133037",  // ← Library ID on page
                    "snapshot": {
                      "page_name": "Nike",                 // ← Advertiser name
                      "caption": "NIKE.COM",               // ← Domain shown
                      "cards": [
                        {
                          "body": "Get the gear...",       // ← Ad copy text
                          "title": "Nike Air Monarch IV",  // ← Product title
                          "resized_image_url": "...",      // ← Ad image URL
                          "link_url": "https://...",       // ← Destination link
                          "cta_text": "Shop Now"           // ← CTA button text
                        }
                      ]
                    },
                    "is_active": true,                     // ← Status (true = Active, false = Inactive)
                    "start_date": 1767859200,             // ← Unix timestamp for start date
                    "end_date": 1768204800,               // ← Unix timestamp for end date (or null if active)
                    "publisher_platform": [                // ← Platforms array
                      "FACEBOOK",
                      "INSTAGRAM"
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
}
```

## Field Mapping Table

| Page Display | GraphQL Path | Our Extracted Field | Example Value |
|-------------|--------------|---------------------|---------------|
| Library ID | `collated_results[].ad_archive_id` | `ad_id` | "25927973150133037" |
| Status (Active/Inactive) | `collated_results[].is_active` | `status` | "active" or "inactive" |
| Platforms (icons) | `collated_results[].publisher_platform[]` | `platforms` | ["Facebook", "Instagram"] |
| Start Date | `collated_results[].start_date` (Unix timestamp) | `start_date` | "2026-01-08" |
| End Date | `collated_results[].end_date` (Unix timestamp) | `end_date` | "2026-01-12" or null |
| Ad Copy Text | `snapshot.cards[0].body` | `ad_copy` | "Get the gear not afraid..." |
| Product Title | `snapshot.cards[0].title` | `title` | "Nike Air Monarch IV" |
| Ad Image | `snapshot.cards[0].resized_image_url` or `original_image_url` | `image_url` | "https://scontent..." |
| Ad Video | `snapshot.cards[0].video_hd_url` or `video_sd_url` | `video_url` | URL or null |
| Asset Type | Determined by presence of video | `asset_type` | "image" or "video" |
| Destination Link | `snapshot.cards[0].link_url` | `link_url` | "https://www.nike.com/..." |
| CTA Text | `snapshot.cards[0].cta_text` | (in raw data) | "Shop Now" |
| Domain/Caption | `snapshot.caption` | (in raw data) | "NIKE.COM" |
| Advertiser Name | `snapshot.page_name` | `page_name` | "Nike" |
| Product Description | `snapshot.cards[0].link_description` | (in raw data) | "Nike delivers innovative..." |

## Important Notes:

1. **Multiple Versions**: Each `collated_result` can have multiple `cards[]` - these represent different versions/variations of the same ad. We typically extract the first card (`cards[0]`).

2. **Date Conversion**: GraphQL returns Unix timestamps (seconds since epoch). We convert them to ISO date strings:
   - `1767859200` → `"2026-01-08"`
   - Use: `datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")`

3. **Platform Mapping**: GraphQL uses uppercase codes like "FACEBOOK", "INSTAGRAM". We map them to readable names:
   - "FACEBOOK" → "Facebook"
   - "INSTAGRAM" → "Instagram"
   - "MESSENGER" → "Messenger"

4. **Status Logic**: 
   - `is_active: true` → status: "active"
   - `is_active: false` → status: "inactive"
   - `end_date` being null typically means ad is still running

5. **Asset Type Detection**:
   - If `video_hd_url` or `video_sd_url` exists → "video"
   - If only `resized_image_url` or `original_image_url` exists → "image"

## Our Parser Implementation:

The `graphql_parser.py` handles all this mapping automatically:
- Extracts from correct paths
- Converts timestamps to dates
- Maps platform codes to names
- Determines asset types
- Handles null values gracefully
