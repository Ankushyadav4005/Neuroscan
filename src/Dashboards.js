import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ["#e05a5a", "#4caf7a"];

const styles = `
  .dashboard { width: 100%; max-width: 640px; }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .stat-card { padding: 20px; border: 1px solid #2a2a2a; background: #111; border-radius: 2px; text-align: center; }
  .stat-number { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 400; color: #c9a84c; }
  .stat-label { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin-top: 6px; }
  .chart-box { border: 1px solid #2a2a2a; background: #111; padding: 24px; border-radius: 2px; margin-bottom: 16px; }
  .chart-box h4 { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 400; color: #e8e4dc; margin-bottom: 20px; }
  .no-data { font-size: 0.72rem; color: #444; text-align: center; padding: 40px; }
`;

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, [token]);

  if (!stats) return <div style={{ color: "#444", fontSize: "0.72rem", textAlign: "center", padding: "40px" }}>Loading...</div>;

  const pieData = [
    { name: "Tumor", value: stats.tumor_count },
    { name: "No Tumor", value: stats.no_tumor_count }
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        {/* Stat Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Scans</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: "#e05a5a" }}>{stats.tumor_count}</div>
            <div className="stat-label">Tumor Detected</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: "#4caf7a" }}>{stats.no_tumor_count}</div>
            <div className="stat-label">No Tumor</div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-box">
          <h4>Tumor vs No Tumor</h4>
          {stats.total === 0 ? (
            <div className="no-data">No scans yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 2, fontSize: "0.72rem" }}
                  itemStyle={{ color: "#e8e4dc" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart */}
        <div className="chart-box">
          <h4>Scans Over Time</h4>
          {stats.daily_data.length === 0 ? (
            <div className="no-data">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.daily_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10 }} />
                <YAxis tick={{ fill: "#555", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 2, fontSize: "0.72rem" }}
                  itemStyle={{ color: "#e8e4dc" }}
                />
                <Line type="monotone" dataKey="scans" stroke="#c9a84c" strokeWidth={2} dot={{ fill: "#c9a84c" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </>
  );
}