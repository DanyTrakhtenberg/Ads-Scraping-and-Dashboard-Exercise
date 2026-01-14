/**
 * Dashboard Page
 */

import { useEffect, useState } from "react";
import { adsApi } from "../services/api";
import type { AdWithRelations, AdFilters, Stats } from "../types";
import { StatsCards } from "../components/stats/StatsCards";
import { AdsByDateChart } from "../components/charts/AdsByDateChart";
import { PlatformChart } from "../components/charts/PlatformChart";
import { AdFilters as AdFiltersComponent } from "../components/filters/AdFilters";
import { AdList } from "../components/ads/AdList";
import { Loading } from "../components/common/Loading";
import { Error } from "../components/common/Error";
import { getErrorMessage } from "../utils/error";

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ads, setAds] = useState<AdWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdFilters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, adsData] = await Promise.all([
        adsApi.getStats(filters),
        adsApi.getAds(filters, { page, limit: 20 }),
      ]);

      setStats(statsData);
      setAds(adsData.data);
      setTotalPages(adsData.totalPages);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, page]);

  const handleFilterChange = (newFilters: AdFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (loading && !stats) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Ads Dashboard</h1>

      <AdFiltersComponent onFilterChange={handleFilterChange} />

      {stats && (
        <>
          <StatsCards total={stats.total} active={stats.active} inactive={stats.inactive} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <AdsByDateChart data={stats.byDate} />
            <PlatformChart data={stats.byPlatform} />
          </div>
        </>
      )}

      <div style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Ads List</h2>
          {stats && (
            <div style={{ color: "#666", fontSize: "0.875rem" }}>
              Showing {ads.length} of {stats.total} ads
              {filters.platform && ` (filtered by: ${filters.platform})`}
              {filters.status && ` (status: ${filters.status})`}
            </div>
          )}
        </div>
        <AdList ads={ads} loading={loading} />

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: "0.5rem 1rem", cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              Previous
            </button>
            <span style={{ padding: "0.5rem" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: "0.5rem 1rem", cursor: page === totalPages ? "not-allowed" : "pointer" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
