"""Script to import ads from scraped_ads.json into database"""
import json
import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Add parent directory to path for imports when running as script
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from database.connection import SessionLocal, init_db, engine
    from database.models import Ad, AdVersion, AdPlatform, AdStatus, AssetType
else:
    from .connection import SessionLocal, init_db, engine
    from .models import Ad, AdVersion, AdPlatform, AdStatus, AssetType


def parse_date(date_str):
    """Parse date string to date object"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        return None


def import_ads_from_json(json_file_path: str):
    """Import ads from JSON file into database"""
    
    # Initialize database (create tables)
    print("Initializing database...")
    init_db()
    
    # Load JSON file
    print(f"Loading ads from {json_file_path}...")
    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    ads_data = data.get("ads", [])
    print(f"Found {len(ads_data)} ads to import")
    
    db: Session = SessionLocal()
    
    imported_count = 0
    updated_count = 0
    error_count = 0
    
    try:
        for ad_data in ads_data:
            try:
                # Check if ad already exists
                existing_ad = db.query(Ad).filter(Ad.ad_id == ad_data["ad_id"]).first()
                
                if existing_ad:
                    # Update existing ad
                    existing_ad.status = AdStatus(ad_data["status"])
                    existing_ad.start_date = parse_date(ad_data["start_date"])
                    existing_ad.end_date = parse_date(ad_data.get("end_date"))
                    existing_ad.page_name = ad_data.get("page_name")
                    existing_ad.page_profile_uri = ad_data.get("page_profile_uri")
                    existing_ad.updated_at = datetime.now()
                    
                    # Delete existing versions and platforms (will be recreated)
                    db.query(AdVersion).filter(AdVersion.ad_id == existing_ad.id).delete()
                    db.query(AdPlatform).filter(AdPlatform.ad_id == existing_ad.id).delete()
                    
                    ad = existing_ad
                    updated_count += 1
                else:
                    # Create new ad
                    ad = Ad(
                        ad_id=ad_data["ad_id"],
                        status=AdStatus(ad_data["status"]),
                        start_date=parse_date(ad_data["start_date"]),
                        end_date=parse_date(ad_data.get("end_date")),
                        page_name=ad_data.get("page_name"),
                        page_profile_uri=ad_data.get("page_profile_uri")
                    )
                    db.add(ad)
                    db.flush()  # Get the ID
                    imported_count += 1
                
                # Import platforms
                platforms = ad_data.get("platforms", [])
                for platform in platforms:
                    platform_entry = AdPlatform(
                        ad_id=ad.id,
                        platform=platform
                    )
                    db.add(platform_entry)
                
                # Import versions
                versions = ad_data.get("versions", [])
                for idx, version_data in enumerate(versions, start=1):
                    asset_type = None
                    if version_data.get("asset_type"):
                        try:
                            asset_type = AssetType(version_data["asset_type"])
                        except:
                            pass
                    
                    version = AdVersion(
                        ad_id=ad.id,
                        version_number=idx,
                        ad_copy=version_data.get("ad_copy"),
                        title=version_data.get("title"),
                        image_url=version_data.get("image_url"),
                        video_url=version_data.get("video_url"),
                        asset_type=asset_type,
                        link_url=version_data.get("link_url"),
                        link_description=version_data.get("link_description"),
                        cta_text=version_data.get("cta_text"),
                        cta_type=version_data.get("cta_type"),
                        caption=version_data.get("caption")
                    )
                    db.add(version)
                
                db.commit()
                print(f"✓ Imported ad {ad.ad_id} ({len(versions)} versions, {len(platforms)} platforms)")
                
            except IntegrityError as e:
                db.rollback()
                error_count += 1
                print(f"✗ Error importing ad {ad_data.get('ad_id', 'unknown')}: {e}")
            except Exception as e:
                db.rollback()
                error_count += 1
                print(f"✗ Error importing ad {ad_data.get('ad_id', 'unknown')}: {e}")
        
        print(f"\n{'='*60}")
        print(f"Import Summary:")
        print(f"  New ads: {imported_count}")
        print(f"  Updated ads: {updated_count}")
        print(f"  Errors: {error_count}")
        print(f"  Total processed: {len(ads_data)}")
        print(f"{'='*60}")
        
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_ads.py <path_to_scraped_ads.json>")
        print("Example: python import_ads.py scraped_ads.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    if not os.path.exists(json_file):
        print(f"Error: File '{json_file}' not found!")
        sys.exit(1)
    
    import_ads_from_json(json_file)
