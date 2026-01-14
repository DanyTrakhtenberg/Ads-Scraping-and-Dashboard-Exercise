/**
 * Platform Distribution Chart Component
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PlatformChartProps {
  data: Array<{ platform: string; count: number }>;
}

export const PlatformChart = ({ data }: PlatformChartProps) => {
  return (
    <div style={{ padding: "1rem", background: "white", borderRadius: "8px", marginBottom: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Ads by Platform</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="platform" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Number of Ads" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
