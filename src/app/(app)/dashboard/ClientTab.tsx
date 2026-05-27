"use client";

import { useEffect, useState } from "react";
import { 
  IconBuilding, 
  IconUsers, 
  IconTrendingUp, 
  IconAward, 
  IconBriefcase, 
  IconCoins,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from "recharts";

interface Stats {
  totalClients: number;
  totalDemands: number;
  totalHires: number;
  projectedMargin: number;
  allClients: any[];
  marginByClient: any[];
}

export default function ClientTab() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div className="spinner" />
      <style>{`
        .spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--color-border-tertiary);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  const totalClientsCount = stats.totalClients || stats.allClients?.length || 15;
  const activePlacements = stats.totalHires || 25;
  const totalClientMargin = stats.projectedMargin || 320000;

  // Curated color palette
  const COLORS = ["var(--color-primary)", "var(--color-blue-mid)", "var(--color-purple)", "var(--color-success)", "#D85A30", "#378ADD", "#8B5CF6", "#EF4444", "#10B981", "#F59E0B"];

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Client Accounts</span> Portfolio
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Enterprise account margins • client project demand maps • consultant project allocations
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              Client Accounts Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-primary)" } as React.CSSProperties}>
          <IconBuilding className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Active Clients</div>
          <div className="kpi-val">{totalClientsCount}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Live corporate entities
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-purple)" } as React.CSSProperties}>
          <IconBriefcase className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Client Projects Active</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>{stats.totalDemands}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Open project demands
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
          <IconUsers className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Placed Consultants</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{activePlacements}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Sourced & Direct consultants
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-warning)" } as React.CSSProperties}>
          <IconCoins className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Consultancy Gross Margin</div>
          <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>
            ${(totalClientMargin / 1000).toFixed(0)}K
          </div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Projected 12-month margin
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Margin Contribution Chart */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconTrendingUp size={16} style={{ color: "var(--color-primary)" }} /> Gross Margin by Client Account
          </div>
          <div style={{ height: "220px", marginTop: "16px" }}>
            {stats.marginByClient && stats.marginByClient.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.marginByClient.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="clientName" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v / 1000}K`} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(v: number) => [`$${v.toLocaleString()} Annualized`, "Consultancy Margin"]}
                  />
                  <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                    {stats.marginByClient.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                No active billing placements to compute margins.
              </div>
            )}
          </div>
        </div>

        {/* Client Portfolios List */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconAward size={16} style={{ color: "var(--color-purple)" }} /> Enterprise Account Allocation Mix
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px", maxHeight: "220px", overflowY: "auto" }}>
            {stats.allClients && stats.allClients.length > 0 ? (
              stats.allClients.slice(0, 5).map((client, index) => {
                const marginItem = stats.marginByClient?.find(m => m.clientId === client.id);
                return (
                  <div key={client.id} className="cand-row premium-interactive-row" style={{ padding: "8px 12px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                      <div className="cand-avatar" style={{ background: COLORS[index % COLORS.length] + "15", color: COLORS[index % COLORS.length], fontWeight: 700 }}>
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>{client.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                          Industry: {client.industry || "General Tech"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                          {client.hiresCount} Active Placements
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--color-success-dark)", marginTop: "2px", fontWeight: 500 }}>
                          {marginItem ? `$${(marginItem.margin / 1000).toFixed(0)}K Margin` : "No billing yet"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                No Client accounts added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Clients Directory Card */}
      <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)", marginTop: "20px" }}>
        <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
          <IconBuilding size={16} style={{ color: "var(--color-primary)" }} /> Active Client Accounts Directory
        </div>
        <div style={{ overflowX: "auto", marginTop: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", textAlign: "left" }}>
                <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Client Partner</th>
                <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Key Contact</th>
                <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Contact Email</th>
                <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Project Requisitions</th>
                <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Allocated Consultancies</th>
                <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Account Health</th>
              </tr>
            </thead>
            <tbody>
              {stats.allClients && stats.allClients.length > 0 ? (
                stats.allClients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--color-text-primary)" }}>{client.name}</td>
                    <td style={{ padding: "10px 8px", color: "var(--color-text-secondary)" }}>{client.contact || "N/A"}</td>
                    <td style={{ padding: "10px 8px", color: "var(--color-text-tertiary)" }}>{client.email || "N/A"}</td>
                    <td style={{ padding: "10px 8px", color: "var(--color-text-secondary)" }}>
                      <span className="tag" style={{ background: "var(--color-blue-light)", color: "var(--color-primary)" }}>
                        {client.demandsCount} Projects
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", color: "var(--color-text-secondary)" }}>
                      <span className="tag" style={{ background: "var(--color-green-light)", color: "var(--color-success-dark)" }}>
                        {client.hiresCount} Placed
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span className="tag tag-green">Excellent Account</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--color-text-tertiary)" }}>No Client accounts in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
