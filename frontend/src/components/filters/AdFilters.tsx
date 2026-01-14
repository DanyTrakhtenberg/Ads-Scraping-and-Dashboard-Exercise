/**
 * Ad Filters Component
 */

import { useState, useEffect } from "react";
import { adsApi } from "../../services/api";
import type { AdFilters as AdFiltersType, AdStatus } from "../../types";
import { getErrorMessage } from "../../utils/error";

interface AdFiltersProps {
  onFilterChange: (filters: AdFiltersType) => void;
}

export const AdFilters = ({ onFilterChange }: AdFiltersProps) => {
  const [status, setStatus] = useState<AdStatus | "">("");
  const [platform, setPlatform] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [platforms, setPlatforms] = useState<Array<{ platform: string; count: number }>>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const platformStats = await adsApi.getPlatformStats();
        setPlatforms(platformStats);
      } catch (err) {
        console.error("Failed to load platforms:", getErrorMessage(err));
      } finally {
        setLoadingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, []);

  const handleApply = () => {
    const filters: AdFiltersType = {};
    if (status) filters.status = status as AdStatus;
    if (platform) filters.platform = platform;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    onFilterChange(filters);
  };

  const handleClear = () => {
    setStatus("");
    setPlatform("");
    setStartDate("");
    setEndDate("");
    onFilterChange({});
  };

  return (
    <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", marginBottom: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Filters</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AdStatus | "")}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
            disabled={loadingPlatforms}
          >
            <option value="">All Platforms</option>
            {platforms.map((p) => (
              <option key={p.platform} value={p.platform}>
                {p.platform} ({p.count})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button onClick={handleApply} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Apply Filters
        </button>
        <button onClick={handleClear} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Clear
        </button>
      </div>
    </div>
  );
};
