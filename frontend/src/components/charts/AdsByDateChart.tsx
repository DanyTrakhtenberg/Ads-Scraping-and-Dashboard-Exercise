/**
 * Ads by Date Chart Component
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AdsByDateChartProps {
  data: Array<{ date: string; count: number; active: number; inactive: number }>;
}

export const AdsByDateChart = ({ data }: AdsByDateChartProps) => {
  return (
    <div style={{ padding: "1rem", background: "white", borderRadius: "8px", marginBottom: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Ads Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" name="Total Ads" />
          <Line type="monotone" dataKey="active" stroke="#82ca9d" name="Active" />
          <Line type="monotone" dataKey="inactive" stroke="#ffc658" name="Inactive" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
