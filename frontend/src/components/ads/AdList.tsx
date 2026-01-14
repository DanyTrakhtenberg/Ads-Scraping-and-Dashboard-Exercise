/**
 * Ad List Component
 */

import { Link } from "react-router-dom";
import type { AdWithRelations } from "../../types";
import { AdStatus } from "../../types";

interface AdListProps {
  ads: AdWithRelations[];
  loading?: boolean;
}

export const AdList = ({ ads, loading }: AdListProps) => {
  if (loading) {
    return <div>Loading ads...</div>;
  }

  if (ads.length === 0) {
    return <div>No ads found</div>;
  }

  return (
    <div>
      {ads.map((ad) => (
        <div
          key={ad.id}
          style={{
            padding: "1rem",
            background: "white",
            borderRadius: "8px",
            marginBottom: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
            <div>
              <Link
                to={`/ads/${ad.id}`}
                style={{ fontSize: "1.2rem", fontWeight: "bold", textDecoration: "none", color: "#333" }}
              >
                Ad ID: {ad.ad_id}
              </Link>
              <div style={{ color: "#666", marginTop: "0.25rem" }}>{ad.page_name}</div>
            </div>
            <div
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "4px",
                background: ad.status === AdStatus.ACTIVE ? "#82ca9d" : "#ffc658",
                color: "white",
                fontSize: "0.875rem",
              }}
            >
              {ad.status}
            </div>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#666" }}>
            <div>
              Platforms: {ad.platforms?.map((p) => p.platform).join(", ") || "N/A"}
            </div>
            <div>
              Dates: {new Date(ad.start_date).toLocaleDateString()} -{" "}
              {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : "Ongoing"}
            </div>
            <div>Versions: {ad.versions?.length || 0}</div>
          </div>
          {ad.versions && ad.versions.length > 0 && ad.versions[0].image_url && (
            <div style={{ marginTop: "0.5rem" }}>
              <img
                src={ad.versions[0].image_url}
                alt={ad.versions[0].title || "Ad image"}
                style={{ maxWidth: "200px", borderRadius: "4px" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
