/**
 * Statistics Cards Component
 */

interface StatsCardsProps {
  total: number;
  active: number;
  inactive: number;
}

export const StatsCards = ({ total, active, inactive }: StatsCardsProps) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
      <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>{total}</div>
        <div style={{ color: "#666", marginTop: "0.5rem" }}>Total Ads</div>
      </div>
      <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#82ca9d" }}>{active}</div>
        <div style={{ color: "#666", marginTop: "0.5rem" }}>Active Ads</div>
      </div>
      <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#ffc658" }}>{inactive}</div>
        <div style={{ color: "#666", marginTop: "0.5rem" }}>Inactive Ads</div>
      </div>
    </div>
  );
};
