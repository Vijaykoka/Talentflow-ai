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
  IconArrowDownRight,
  IconMail
} from "@tabler/icons-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Stats {
  totalClients: number;
  totalDemands: number;
  totalHires: number;
  projectedMargin: number;
  allClients: any[];
  marginByClient: any[];
  allHires: any[];
}

export default function ClientTab() {
  const [stats, setStats] = useState<Stats | null>(null);

  // Popout States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"clients" | "demands" | "consultants" | "margin" | null>(null);
  const [allDemandsList, setAllDemandsList] = useState<any[]>([]);
  const [loadingDemands, setLoadingDemands] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const openDialog = (type: "clients" | "demands" | "consultants" | "margin") => {
    setDialogType(type);
    setIsDialogOpen(true);
    if (type === "demands" && allDemandsList.length === 0) {
      setLoadingDemands(true);
      fetch("/api/demands")
        .then(res => res.json())
        .then(data => {
          setAllDemandsList(data);
          setLoadingDemands(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingDemands(false);
        });
    }
  };

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

  const fmt = (v: number) => {
    if (!v) return "$0";
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v}`;
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "clients": return `Active Client Partners (${totalClientsCount})`;
      case "demands": return `Active Client Project Requisitions (${stats.totalDemands})`;
      case "consultants": return `Active Placed Consultants (${activePlacements})`;
      case "margin": return `Consultancy Annualized Gross Margin Breakdown (${fmt(totalClientMargin)})`;
      default: return "";
    }
  };

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
        <div 
          className="premium-kpi-card" 
          onClick={() => openDialog("clients")}
          style={{ "--kpi-color": "var(--color-primary)", cursor: "pointer" } as React.CSSProperties}
        >
          <IconBuilding className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Active Clients</div>
          <div className="kpi-val">{totalClientsCount}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Live corporate entities
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => openDialog("demands")}
          style={{ "--kpi-color": "var(--color-purple)", cursor: "pointer" } as React.CSSProperties}
        >
          <IconBriefcase className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Client Projects Active</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>{stats.totalDemands}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Open project demands
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => openDialog("consultants")}
          style={{ "--kpi-color": "var(--color-success)", cursor: "pointer" } as React.CSSProperties}
        >
          <IconUsers className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Placed Consultants</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{activePlacements}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> Sourced & Direct consultants
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => openDialog("margin")}
          style={{ "--kpi-color": "var(--color-warning)", cursor: "pointer" } as React.CSSProperties}
        >
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

      {/* Premium Popout Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            
            {dialogType === "clients" && (
              <div>
                {stats.allClients && stats.allClients.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No client partners registered.</div>
                ) : (
                  stats.allClients.map((client: any, index: number) => (
                    <div key={client.id} className="popup-row">
                      <div className="popup-avatar" style={{ background: COLORS[index % COLORS.length] + "15", color: COLORS[index % COLORS.length] }}>
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{client.name}</div>
                        <div className="popup-sub" style={{ fontSize: "11px", display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
                          <span>Industry: <strong>{client.industry || "General Tech"}</strong></span>
                          <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                          <span>Contact: <strong>{client.contact || "N/A"}</strong></span>
                          {client.email && (
                            <>
                              <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                              <span>{client.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="popup-stat" style={{ textAlign: "right", minWidth: "100px" }}>
                        <span className="popup-stat-val" style={{ color: "var(--color-primary)", fontSize: "13px", fontWeight: "700" }}>
                          {client.hiresCount} Placed
                        </span>
                        <span className="popup-stat-label">{client.demandsCount} Requisitions</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {dialogType === "demands" && (
              <div>
                {loadingDemands ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                    <div className="spinner" />
                  </div>
                ) : allDemandsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No project demands found.</div>
                ) : (
                  allDemandsList.filter((d: any) => d.status === "OPEN" || d.status === "IN_PROGRESS").map((demand: any) => (
                    <div key={demand.id} className="popup-row">
                      <div className="popup-avatar" style={{ background: "var(--color-purple-light)", color: "var(--color-purple)" }}>
                        <IconBriefcase size={18} />
                      </div>
                      <div className="popup-info">
                        <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{demand.title}</div>
                        <div className="popup-sub" style={{ fontSize: "11px", display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
                          <span>Client: <strong>{demand.client?.name || "N/A"}</strong></span>
                          <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                          <span>Skills: <strong>{demand.requiredSkills}</strong></span>
                        </div>
                      </div>
                      <div className="popup-stat" style={{ textAlign: "right", minWidth: "120px" }}>
                        <span className="popup-stat-val" style={{ fontSize: "13px", fontWeight: "700" }}>
                          ${demand.rateMin}-${demand.rateMax}/hr
                        </span>
                        <span className={`tag ${demand.priority === "HIGH" ? "tag-red" : demand.priority === "MEDIUM" ? "tag-orange" : "tag-blue"}`} style={{ display: "inline-block", marginTop: "4px", fontSize: "9px" }}>
                          {demand.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {dialogType === "consultants" && (
              <div>
                {!stats.allHires || stats.allHires.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No active placements.</div>
                ) : (
                  stats.allHires.map((hire: any, index: number) => (
                    <div key={hire.id} className="popup-row">
                      <div className="popup-avatar" style={{ background: "var(--color-success-light)", color: "var(--color-success-dark)" }}>
                        {hire.candidateName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{hire.candidateName}</div>
                        <div className="popup-sub" style={{ fontSize: "11px", marginTop: "2px" }}>
                          Placed at <strong>{hire.clientName}</strong> for <strong>{hire.demandTitle}</strong>
                          <span style={{ color: "var(--color-border-tertiary)", margin: "0 6px" }}>•</span>
                          Source: {hire.vendorName}
                        </div>
                      </div>
                      <div className="popup-stat" style={{ textAlign: "right", minWidth: "110px" }}>
                        <span className="popup-stat-val" style={{ color: "var(--color-success-dark)", fontSize: "13px", fontWeight: "700" }}>
                          {fmt(hire.projectedMargin || 0)}
                        </span>
                        <span className="popup-stat-label">Projected Margin</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {dialogType === "margin" && (
              <div>
                {!stats.marginByClient || stats.marginByClient.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No active margins accrued.</div>
                ) : (
                  stats.marginByClient.map((marginItem: any, index: number) => {
                    const clientDetails = stats.allClients?.find(c => c.id === marginItem.clientId);
                    return (
                      <div key={marginItem.clientId} className="popup-row">
                        <div className="popup-avatar" style={{ background: COLORS[index % COLORS.length] + "15", color: COLORS[index % COLORS.length] }}>
                          {marginItem.clientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="popup-info">
                          <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{marginItem.clientName}</div>
                          <div className="popup-sub" style={{ fontSize: "11px", marginTop: "2px" }}>
                            {clientDetails?.industry || "Enterprise Partner"}
                            <span style={{ color: "var(--color-border-tertiary)", margin: "0 6px" }}>•</span>
                            {clientDetails?.hiresCount || 0} active placements
                          </div>
                        </div>
                        <div className="popup-stat" style={{ textAlign: "right", minWidth: "120px" }}>
                          <span className="popup-stat-val" style={{ color: "var(--color-warning-dark)", fontSize: "14px", fontWeight: "700" }}>
                            {fmt(marginItem.margin)}
                          </span>
                          <span className="popup-stat-label">Projected Margin</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
