"""
Parser to extract ad data from Facebook Ads Library GraphQL responses
"""
import json
from datetime import datetime
from typing import List, Dict, Any, Optional


def parse_timestamp(timestamp: Optional[int]) -> Optional[str]:
    """Convert Unix timestamp to ISO date string"""
    if timestamp:
        try:
            return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
        except:
            return str(timestamp)
    return None


def parse_platforms(platforms: List[str]) -> List[str]:
    """Convert platform codes to readable names"""
    platform_map = {
        "FACEBOOK": "Facebook",
        "INSTAGRAM": "Instagram",
        "MESSENGER": "Messenger",
        "WHATSAPP": "WhatsApp",
        "AUDIENCE_NETWORK": "Audience Network"
    }
    return [platform_map.get(p.upper(), p) for p in platforms if p]


def extract_ad_assets(snapshot: Dict[str, Any]) -> Dict[str, Optional[str]]:
    """Extract image/video URLs from ad snapshot"""
    assets = {
        "image_url": None,
        "video_url": None,
        "asset_type": None
    }
    
    cards = snapshot.get("cards", [])
    if cards:
        # Get the first card (usually the main ad)
        first_card = cards[0]
        
        # Check for video
        if first_card.get("video_hd_url"):
            assets["video_url"] = first_card["video_hd_url"]
            assets["asset_type"] = "video"
        elif first_card.get("video_sd_url"):
            assets["video_url"] = first_card["video_sd_url"]
            assets["asset_type"] = "video"
        
        # Check for image (if no video)
        if not assets["video_url"]:
            if first_card.get("resized_image_url"):
                assets["image_url"] = first_card["resized_image_url"]
                assets["asset_type"] = "image"
            elif first_card.get("original_image_url"):
                assets["image_url"] = first_card["original_image_url"]
                assets["asset_type"] = "image"
    
    return assets


def parse_card(card: Dict[str, Any]) -> Dict[str, Any]:
    """Parse a single card (ad version) into structured data"""
    # Extract assets for this card
    image_url = None
    video_url = None
    asset_type = None
    
    if card.get("video_hd_url"):
        video_url = card["video_hd_url"]
        asset_type = "video"
    elif card.get("video_sd_url"):
        video_url = card["video_sd_url"]
        asset_type = "video"
    elif card.get("resized_image_url"):
        image_url = card["resized_image_url"]
        asset_type = "image"
    elif card.get("original_image_url"):
        image_url = card["original_image_url"]
        asset_type = "image"
    
    return {
        "ad_copy": card.get("body", ""),
        "title": card.get("title"),
        "image_url": image_url,
        "video_url": video_url,
        "asset_type": asset_type,
        "link_url": card.get("link_url"),
        "link_description": card.get("link_description"),
        "cta_text": card.get("cta_text"),
        "cta_type": card.get("cta_type"),
        "caption": card.get("caption"),
    }


def parse_collated_result(result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parse a single collated result into structured ad data with all versions"""
    try:
        ad_id = result.get("ad_archive_id")
        if not ad_id:
            return None
        
        snapshot = result.get("snapshot", {})
        cards = snapshot.get("cards", [])
        if not cards:
            return None
        
        # Extract metadata (same for all versions)
        is_active = result.get("is_active", False)
        start_date_ts = result.get("start_date")
        end_date_ts = result.get("end_date")
        publisher_platforms = result.get("publisher_platform", [])
        
        # Parse all cards (versions)
        versions = []
        for card in cards:
            version_data = parse_card(card)
            versions.append(version_data)
        
        # Build ad data with all versions
        ad_data = {
            "ad_id": str(ad_id),
            "status": "active" if is_active else "inactive",
            "platforms": parse_platforms(publisher_platforms),
            "start_date": parse_timestamp(start_date_ts),
            "end_date": parse_timestamp(end_date_ts),
            "page_name": snapshot.get("page_name"),
            "page_profile_uri": snapshot.get("page_profile_uri"),
            "versions": versions,  # All versions/cards for this ad
            "version_count": len(versions),  # Number of versions
        }
        
        return ad_data
        
    except Exception as e:
        print(f"Error parsing collated result: {e}")
        return None


def parse_graphql_responses(responses: List[Dict[str, Any]], max_ads: int = 50) -> List[Dict[str, Any]]:
    """
    Parse GraphQL responses and extract ad data
    
    Args:
        responses: List of GraphQL response objects with 'url' and 'data' keys
        max_ads: Maximum number of ads to extract
        
    Returns:
        List of parsed ad dictionaries
    """
    ads = []
    seen_ad_ids = set()
    
    for response_obj in responses:
        try:
            data = response_obj.get("data", {})
            inner_data = data.get("data", {})
            ad_library = inner_data.get("ad_library_main", {})
            search_results = ad_library.get("search_results_connection", {})
            edges = search_results.get("edges", [])
            
            for edge in edges:
                node = edge.get("node", {})
                collated_results = node.get("collated_results", [])
                
                for result in collated_results:
                    ad_data = parse_collated_result(result)
                    
                    if ad_data:
                        ad_id = ad_data["ad_id"]
                        
                        # Skip duplicates
                        if ad_id not in seen_ad_ids:
                            seen_ad_ids.add(ad_id)
                            ads.append(ad_data)
                            
                            if len(ads) >= max_ads:
                                return ads
                                
        except Exception as e:
            print(f"Error parsing response: {e}")
            continue
    
    return ads


def parse_graphql_file(file_path: str, max_ads: int = 50) -> List[Dict[str, Any]]:
    """Load and parse GraphQL responses from a JSON file"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            responses = json.load(f)
        return parse_graphql_responses(responses, max_ads)
    except Exception as e:
        print(f"Error loading file {file_path}: {e}")
        return []
