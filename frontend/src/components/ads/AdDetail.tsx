/**
 * Ad Detail Component
 */

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adsApi } from "../../services/api";
import type { AdWithRelations } from "../../types";
import { AdStatus } from "../../types";
import { Loading } from "../common/Loading";
import { Error } from "../common/Error";
import { getErrorMessage } from "../../utils/error";

export const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<AdWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAd = async () => {
      try {
        setLoading(true);
        const data = await adsApi.getAdById(id);
        setAd(data);
      } catch (err) {
        setError(getErrorMessage(err) || "Failed to load ad");
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!ad) return <Error message="Ad not found" />;

  return (
    <div style={{ padding: "2rem" }}>
      <Link to="/" style={{ marginBottom: "1rem", display: "inline-block", color: "#333", textDecoration: "none" }}>
        ← Back to Dashboard
      </Link>

      <div style={{ background: "white", borderRadius: "8px", padding: "2rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ marginTop: 0 }}>Ad ID: {ad.ad_id}</h1>
            <div style={{ color: "#666", marginTop: "0.5rem" }}>Page: {ad.page_name}</div>
          </div>
          <div
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              background: ad.status === AdStatus.ACTIVE ? "#82ca9d" : "#ffc658",
              color: "white",
            }}
          >
            {ad.status}
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <h2>Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <strong>Start Date:</strong> {new Date(ad.start_date).toLocaleDateString()}
            </div>
            <div>
              <strong>End Date:</strong> {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : "Ongoing"}
            </div>
            <div>
              <strong>Platforms:</strong> {ad.platforms?.map((p) => p.platform).join(", ") || "N/A"}
            </div>
            <div>
              <strong>Versions:</strong> {ad.versions?.length || 0}
            </div>
          </div>
        </div>

        {ad.versions && ad.versions.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2>Ad Versions ({ad.versions.length})</h2>
            {ad.versions.map((version) => (
              <div
                key={version.id}
                style={{
                  padding: "1.5rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Version {version.version_number}</h3>
                {version.title && <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>{version.title}</div>}
                {version.ad_copy && <div style={{ marginBottom: "0.5rem", color: "#666" }}>{version.ad_copy}</div>}
                {version.image_url && (
                  <div style={{ marginTop: "1rem" }}>
                    <img
                      src={version.image_url}
                      alt={version.title || "Ad image"}
                      style={{ maxWidth: "400px", borderRadius: "4px" }}
                    />
                  </div>
                )}
                {version.video_url && (
                  <div style={{ marginTop: "1rem" }}>
                    <video controls style={{ maxWidth: "400px", borderRadius: "4px" }}>
                      <source src={version.video_url} />
                    </video>
                  </div>
                )}
                {version.link_url && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <a href={version.link_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc" }}>
                      {version.link_url}
                    </a>
                  </div>
                )}
                {version.cta_text && (
                  <div style={{ marginTop: "0.5rem", color: "#666" }}>CTA: {version.cta_text}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
