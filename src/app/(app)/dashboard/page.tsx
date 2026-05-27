"use client";

import React, { useEffect, useState, Fragment } from "react";
import { useTab } from "@/lib/context/tab-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  IconFilter,
  IconFlame,
  IconChartBar,
  IconStar,
  IconCode,
  IconAward,
  IconCalculator,
  IconBuildingStore,
  IconBuilding,
  IconMap2,
  IconListCheck,
  IconArrowUpRight,
  IconArrowDownRight,
  IconBolt,
  IconClock,
  IconAlertCircle,
  IconBriefcase,
  IconTrendingUp,
  IconChartPie,
  IconUsers,
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, RadialBarChart, RadialBar
} from "recharts";
import PipelineTab from "./PipelineTab";
import SkillGapTab from "./SkillGapTab";
import LocationMatchTab from "./LocationMatchTab";
import ClientTab from "./ClientTab";
import ActivityTab from "./ActivityTab";
import CreateDemandTab from "./CreateDemandTab";
import InterviewFeedbackTab from "./InterviewFeedbackTab";
import TdafTab from "./TdafTab";


interface Stats {
  totalDemands: number;
  openDemands: number;
  totalCandidates: number;
  hotTalentCount: number;
  availableNow: number;
  totalHires: number;
  totalVendors: number;
  projectedMargin: number;
  avgMonthlyMargin: number;
  revenueAtRisk: number;
  avgTimeToFill: number;
  demandsByPriority: Record<string, number>;
  demandsByStatus: Record<string, number>;
  pipelineData: { status: string; count: number }[];
  recentHires: any[];
  topVendors: any[];
  skillDistribution: { skill: string; count: number }[];
  marginByVendor: { vendorId: string; vendorName: string; margin: number }[];
  hotDemands: { id: string; title: string; priority: string; daysAging: number; status: string; location: string }[];
  hotTalents: { id: string; name: string; skills: string; matchScore: number }[];
  allHires: any[];
  allVendors: any[];
  matchesToday: number;
  excellentFits: number;
  avgMatchScore: number;
  processingTime: number;
}

const fmt = (v: number) => {
  if (!v) return "$0";
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
};

function formatDate(date: string | null) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "-";
  }
}

function parseSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  try {
    const parsed = JSON.parse(skills);
    return Array.isArray(parsed) ? parsed : [String(skills)];
  } catch {
    if (typeof skills === "string") {
      return skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
}

export default function DashboardPage() {
  const { activeTab } = useTab();

  return (
    <>
      {activeTab === "tdaf" && <TdafTab />}
      {activeTab === "demand" && <DemandTab />}
      {activeTab === "supply" && <SupplyTab />}
      {activeTab === "matching" && <MatchingTab />}
      {activeTab === "margin" && <MarginTab />}
      {activeTab === "vendor" && <VendorTab />}
      {activeTab === "client" && <ClientTab />}
      {activeTab === "projects" && <ProjectsTab />}
      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "skillgap" && <SkillGapTab />}
      {activeTab === "locationmatch" && <LocationMatchTab />}
      {activeTab === "activity" && <ActivityTab />}
      {activeTab === "createDemand" && <CreateDemandTab />}
      {activeTab === "feedback" && <InterviewFeedbackTab />}
    </>
  );
}

function DemandTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openDemandsList, setOpenDemandsList] = useState<any[]>([]);
  const [loadingDemands, setLoadingDemands] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const handleOpenDemandsClick = async () => {
    setIsDialogOpen(true);
    setLoadingDemands(true);
    try {
      const res = await fetch("/api/demands");
      const data = await res.json();
      setOpenDemandsList(data.filter((d: any) => d.status === "OPEN"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDemands(false);
    }
  };

  if (!stats) return <LoadingState />;

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Demand Intelligence</span> Dashboard
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Open job pipeline • contract values at risk • automated aging and priority alerts
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              Live Pipeline Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div 
          className="premium-kpi-card" 
          onClick={handleOpenDemandsClick}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-primary)" } as React.CSSProperties}
        >
          <IconBriefcase className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Open Demands</div>
          <div className="kpi-val">{stats.openDemands}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> {stats.totalDemands} total active
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.totalDemands ? (stats.openDemands / stats.totalDemands) * 100 : 70}%`, background: "var(--color-primary)" }} />
          </div>
        </div>
        
        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-error)" } as React.CSSProperties}>
          <IconTrendingUp className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Revenue at Risk</div>
          <div className="kpi-val" style={{ color: "var(--color-error-dark)" }}>{fmt(stats.revenueAtRisk)}</div>
          <div className="kpi-delta down" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowDownRight size={12} /> {stats.openDemands} contracts
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-red-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "75%", background: "var(--color-error)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
          <IconClock className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Avg Time-to-Fill</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{stats.avgTimeToFill || 9}d</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> vs 44d industry manual
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "85%", background: "var(--color-success)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-warning)" } as React.CSSProperties}>
          <IconFlame className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Hot Demands</div>
          <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>{stats.hotDemands.length}</div>
          <div className="kpi-delta down" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconAlertCircle size={12} /> {"aging >7d active"}
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-amber-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "40%", background: "var(--color-warning)" }} />
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Funnel Graph */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconChartBar size={16} style={{ color: "var(--color-primary)" }} /> Hiring Pipeline Funnel
          </div>
          <div className="chart-container" style={{ marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={[
                { name: "Applied", count: 142 },
                { name: "Screened", count: 108 },
                { name: "Interview", count: 64 },
                { name: "Offer", count: 31 },
                { name: "Hired", count: 20 },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPipeline)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", padding: "0 8px" }}>
            {[
              { label: "Applied", count: 142, color: "var(--color-primary)" },
              { label: "Screened", count: 108, color: "var(--color-blue-mid)" },
              { label: "Interview", count: 64, color: "var(--color-purple)" },
              { label: "Offer", count: 31, color: "var(--color-warning)" },
              { label: "Hired", count: 20, color: "var(--color-success)" },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: item.color }}>{item.count}</div>
                <div style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "2px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Demands & Pie chart breakdown */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconFlame size={16} style={{ color: "var(--color-error)" }} /> Hot Demands & Priority Distribution
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* List */}
            <div className="demand-list" style={{ flex: 1, minWidth: "180px" }}>
              {stats.hotDemands.length === 0 ? (
                <div className="demand-row" style={{ justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                  No hot demands active
                </div>
              ) : (
                stats.hotDemands.slice(0, 4).map(demand => (
                  <div key={demand.id} className="premium-interactive-row" style={{ padding: "8px 10px" }}>
                    <div
                      className="priority-dot"
                      style={{ background: demand.priority === "HIGH" ? "#E24B4A" : demand.priority === "MEDIUM" ? "#EF9F27" : "#639922" }}
                    />
                    <span className="demand-title" style={{ fontSize: "12px" }}>{demand.title}</span>
                    <span className={`tag ${demand.priority === "HIGH" ? "tag-red" : demand.priority === "MEDIUM" ? "tag-amber" : "tag-green"}`} style={{ fontSize: "9px", padding: "1px 5px" }}>
                      {demand.priority === "HIGH" ? "Hot" : demand.priority === "MEDIUM" ? "Mid" : "Low"}
                    </span>
                    <span className="days" style={{ fontSize: "10px", fontWeight: 500 }}>{demand.daysAging}d</span>
                  </div>
                ))
              )}
            </div>

            {/* Mini Donut Chart */}
            <div style={{ width: "110px", height: "110px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "High", value: stats.demandsByPriority?.HIGH || stats.hotDemands.filter(d => d.priority === "HIGH").length || 3 },
                      { name: "Medium", value: stats.demandsByPriority?.MEDIUM || stats.hotDemands.filter(d => d.priority === "MEDIUM").length || 2 },
                      { name: "Low", value: stats.demandsByPriority?.LOW || stats.hotDemands.filter(d => d.priority === "LOW").length || 1 },
                    ].filter(d => d.value > 0)}
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[
                      <Cell key="cell-0" fill="#E24B4A" />,
                      <Cell key="cell-1" fill="#EF9F27" />,
                      <Cell key="cell-2" fill="#639922" />,
                    ]}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ fontSize: "9px", fontWeight: 600, color: "var(--color-text-secondary)", marginTop: "-10px", textAlign: "center" }}>
                Priority Mix
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>All Open Demands ({openDemandsList.length})</DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body">
            {loadingDemands ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                <div style={{ width: "24px", height: "24px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <div>
                {openDemandsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No open demands found.</div>
                ) : (
                  openDemandsList.map(demand => {
                    const atMatch = demand.title.match(/\s+at\s+([A-Za-z0-9\s]+)$/i);
                    const extractedClient = atMatch ? atMatch[1].trim() : null;
                    const clientName = demand.client?.name || extractedClient || "Google";
                    const cleanTitle = demand.title.replace(/\s+at\s+[A-Za-z0-9\s]+$/i, "").trim();
                    const displayTitle = `${cleanTitle} for ${clientName} client`;

                    const clientMin = demand.rateMin;
                    const clientMax = demand.rateMax;
                    const resourceMin = Math.round(clientMin * 0.7);
                    const resourceMax = Math.round(clientMax * 0.7);

                    return (
                      <div key={demand.id} className="popup-row" style={{ padding: "12px 16px" }}>
                        <div
                          className="popup-avatar small"
                          style={{ background: demand.priority === "HIGH" ? "var(--color-error)" : demand.priority === "MEDIUM" ? "var(--color-warning)" : "var(--color-success)", marginTop: "4px" }}
                        />
                        <div className="popup-info" style={{ flex: 1 }}>
                          <div className="popup-title" style={{ fontWeight: 600, fontSize: "13px" }}>{displayTitle}</div>
                          <div className="popup-sub" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", marginTop: "2px" }}>
                            <IconBuildingStore size={12} /> <span>{demand.vendor?.name || "Internal Direct"}</span>
                            <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                            <span>{demand.location || "Remote / Hybrid"}</span>
                          </div>
                        </div>
                        <div className="popup-stat" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", minWidth: "180px", paddingLeft: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="popup-tag" style={{ background: demand.priority === "HIGH" ? "var(--color-red-light)" : demand.priority === "MEDIUM" ? "var(--color-amber-light)" : "var(--color-green-light)", color: demand.priority === "HIGH" ? "var(--color-error-dark)" : demand.priority === "MEDIUM" ? "var(--color-warning-dark)" : "var(--color-success-dark)", fontSize: "10px", padding: "1px 6px" }}>
                              {demand.priority === "HIGH" ? "High" : demand.priority === "MEDIUM" ? "Medium" : "Low"}
                            </span>
                            <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-tertiary)" }}>Billing:</span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)" }}>
                              ${clientMin}-${clientMax}/hr
                            </span>
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
                            Resource Pay: <span style={{ color: "var(--color-success-dark)", fontWeight: 600 }}>${resourceMin}-${resourceMax}/hr</span>
                          </div>
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

function SupplyTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"total" | "hot" | "available" | "matches">("total");
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const handleKpiClick = async (type: "total" | "hot" | "available" | "matches") => {
    setIsDialogOpen(true);
    setDialogType(type);
    
    if (type === "matches" && stats) {
      setCandidatesList(stats.hotTalents || []);
      return;
    }

    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/candidates");
      let data = await res.json();
      
      if (type === "hot") {
        data = data.filter((c: any) => c.hotTalent);
      } else if (type === "available") {
        data = data.filter((c: any) => c.status === "AVAILABLE");
      }
      
      setCandidatesList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  if (!stats) return <LoadingState />;

  const getDialogTitle = () => {
    switch (dialogType) {
      case "total": return "Total Candidates";
      case "hot": return "Hot Talent";
      case "available": return "Available Now";
      case "matches": return "Top Matches";
      default: return "Candidates";
    }
  };

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Supply & Talent</span> Directory
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Comprehensive talent directory • skill gap matrix • real-time availability tracking
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              Talent Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div 
          className="premium-kpi-card" 
          onClick={() => handleKpiClick("total")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-primary)" } as React.CSSProperties}
        >
          <IconUsers className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Total Candidates</div>
          <div className="kpi-val">{stats.totalCandidates}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> +23 candidate signups
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "80%", background: "var(--color-primary)" }} />
          </div>
        </div>
        
        <div 
          className="premium-kpi-card" 
          onClick={() => handleKpiClick("hot")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-purple)" } as React.CSSProperties}
        >
          <IconStar className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Hot Talent</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>{stats.hotTalentCount}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconStar size={12} /> auto-flagged AI match
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.totalCandidates ? (stats.hotTalentCount / stats.totalCandidates) * 100 : 30}%`, background: "var(--color-purple)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => handleKpiClick("available")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-success)" } as React.CSSProperties}
        >
          <IconClock className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Available Now</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{stats.availableNow}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconClock size={12} /> immediate placement
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.totalCandidates ? (stats.availableNow / stats.totalCandidates) * 100 : 50}%`, background: "var(--color-success)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => handleKpiClick("matches")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-warning)" } as React.CSSProperties}
        >
          <IconAward className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Avg Match Score</div>
          <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>{stats.avgMatchScore.toFixed(0)}%</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> composite matching
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-amber-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.avgMatchScore}%`, background: "var(--color-warning)" }} />
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Talent Donut Chart */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconChartPie size={16} style={{ color: "var(--color-primary)" }} /> Talent Pool by Top Skills
          </div>
          <div style={{ position: "relative", width: "100%", height: "190px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.skillDistribution.slice(0, 5)}
                  dataKey="count"
                  nameKey="skill"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {["var(--color-primary)", "var(--color-blue-mid)", "var(--color-purple)", "var(--color-success)", "#D85A30"].map((color, i) => (
                    <Cell key={`cell-${i}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [`${value} candidates`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none"
            }}>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "'Outfit', sans-serif" }}>
                {stats.totalCandidates}
              </div>
              <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
                Pool Size
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px", justifyContent: "center" }}>
            {stats.skillDistribution.slice(0, 5).map((item, i) => {
              const colors = ["var(--color-primary)", "var(--color-blue-mid)", "var(--color-purple)", "var(--color-success)", "#D85A30"];
              return (
                <div key={item.skill} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors[i] }} />
                  {item.skill}: {item.count}
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Level & Hot Talent */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconStar size={16} style={{ color: "var(--color-warning-dark)" }} /> Experience Mix & Top Matches
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Experience chart */}
            <div style={{ flex: 1, minWidth: "160px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                Experience Distribution
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={[
                  { name: "Junior", count: Math.round(stats.totalCandidates * 0.15) || 5, fill: "var(--color-blue-light)" },
                  { name: "Mid", count: Math.round(stats.totalCandidates * 0.35) || 12, fill: "var(--color-blue-mid)" },
                  { name: "Senior", count: Math.round(stats.totalCandidates * 0.38) || 13, fill: "var(--color-primary)" },
                  { name: "Lead", count: Math.round(stats.totalCandidates * 0.12) || 4, fill: "var(--color-purple)" },
                ]} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {["var(--color-blue-pale)", "var(--color-blue-mid)", "var(--color-primary)", "var(--color-purple)"].map((color, i) => (
                      <Cell key={`cell-${i}`} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Hot Candidates */}
            <div className="candidate-list" style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                Hot Talent Profiles
              </div>
              {stats.hotTalents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                  No hot talent candidates
                </div>
              ) : (
                stats.hotTalents.slice(0, 3).map(talent => (
                  <div key={talent.id} className="cand-row premium-interactive-row" style={{ padding: "6px 10px" }}>
                    <div
                      className="cand-avatar"
                      style={{ background: "var(--color-blue-light)", color: "var(--color-primary)", width: "26px", height: "26px", fontSize: "10px" }}
                    >
                      {talent.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cand-name" style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{talent.name}</div>
                      <div className="cand-skills" style={{ fontSize: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{talent.skills}</div>
                    </div>
                    <span className={`score-pill ${talent.matchScore >= 85 ? "score-high" : "score-mid"}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
                      {talent.matchScore}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>{getDialogTitle()} ({candidatesList.length})</DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body">
            {loadingCandidates ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                <div style={{ width: "24px", height: "24px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <div>
                {candidatesList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No candidates found.</div>
                ) : (
                  candidatesList.map((candidate: any) => (
                    <div key={candidate.id} className="popup-row">
                      <div className="popup-avatar">
                        {candidate.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title">{candidate.name}</div>
                        <div className="popup-sub">
                          <IconCode size={12} />
                          {candidate.skills || (candidate.extractedSkills ? parseSkills(candidate.extractedSkills).slice(0, 3).join(" · ") : "N/A")}
                        </div>
                      </div>
                      <div className="popup-stat" style={{ flexDirection: "row", alignItems: "center" }}>
                        {dialogType === "matches" && candidate.matchScore ? (
                          <span className="popup-tag" style={{ background: candidate.matchScore >= 85 ? "var(--color-green-light)" : "var(--color-amber-light)", color: candidate.matchScore >= 85 ? "var(--color-success-dark)" : "var(--color-warning-dark)", borderRadius: "12px", padding: "6px 12px", fontSize: "12px" }}>
                            {candidate.matchScore}% Match
                          </span>
                        ) : (
                          <span className="popup-tag" style={{ background: candidate.hotTalent ? "var(--color-red-light)" : "var(--color-background-tertiary)", color: candidate.hotTalent ? "var(--color-error-dark)" : "var(--color-text-secondary)" }}>
                            {candidate.hotTalent ? "Hot Talent" : "Standard"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchingTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"matches" | "excellent">("matches");
  const [skillWeight, setSkillWeight] = useState(50);
  const [expWeight, setExpWeight] = useState(30);
  const [rateWeight, setRateWeight] = useState(20);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <LoadingState />;

  const handleKpiClick = (type: "matches" | "excellent") => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "matches": return "Matches Today";
      case "excellent": return "Excellent Fits (Score ≥ 90)";
      default: return "Matches";
    }
  };

  const displayList = stats.hotTalents || [];

  // Simulated average sub-scores
  const skillAvg = 85;
  const expAvg = 74;
  const rateAvg = 69;

  const totalWeight = skillWeight + expWeight + rateWeight;
  const liveAvgScore = totalWeight > 0 
    ? ((skillAvg * skillWeight) + (expAvg * expWeight) + (rateAvg * rateWeight)) / totalWeight 
    : 0;

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">AI Matching</span> Engine
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Multi-factor semantic embedding comparison • rate compatibility • experience fit modeling
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              AI Scorer Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("matches")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-primary)" } as React.CSSProperties}
        >
          <IconBolt className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Matches Today</div>
          <div className="kpi-val">{stats.matchesToday}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconBolt size={12} /> auto-processed queue
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "90%", background: "var(--color-primary)" }} />
          </div>
        </div>
        
        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("excellent")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-success)" } as React.CSSProperties}
        >
          <IconAward className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Excellent Fits</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{stats.excellentFits}</div>
          <div className="kpi-delta" style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-success-dark)" }}>
            score &ge; 90 composite
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.matchesToday ? (stats.excellentFits / stats.matchesToday) * 100 : 40}%`, background: "var(--color-success)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-warning)" } as React.CSSProperties}>
          <IconAward className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Avg Match Score</div>
          <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>{stats.avgMatchScore.toFixed(1)}%</div>
          <div className="kpi-delta" style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-warning-dark)" }}>
            out of 100 max
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-amber-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.avgMatchScore}%`, background: "var(--color-warning)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-purple)" } as React.CSSProperties}>
          <IconClock className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Processing Speed</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>{stats.processingTime.toFixed(1)}s</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> per candidate profile
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "95%", background: "var(--color-purple)" }} />
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Interactive Weight Calculator */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconCode size={16} style={{ color: "var(--color-primary)" }} /> Composite Score Weight Cockpit
          </div>
          <div style={{ display: "flex", gap: "20px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Weight Sliders */}
            <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>
                  <span>Skill Overlap Weight</span>
                  <span style={{ color: "var(--color-primary)" }}>{skillWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillWeight}
                  onChange={(e) => setSkillWeight(Number(e.target.value))}
                  className="premium-slider"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>
                  <span>Experience Fit Weight</span>
                  <span style={{ color: "var(--color-purple)" }}>{expWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={expWeight}
                  onChange={(e) => setExpWeight(Number(e.target.value))}
                  className="premium-slider"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>
                  <span>Rate Compatibility Weight</span>
                  <span style={{ color: "var(--color-success)" }}>{rateWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rateWeight}
                  onChange={(e) => setRateWeight(Number(e.target.value))}
                  className="premium-slider"
                />
              </div>
            </div>

            {/* Recalculated Score Gauge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "120px", flexShrink: 0 }}>
              <div style={{ position: "relative", width: "90px", height: "90px" }}>
                <svg className="radial-progress-svg" width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="38" fill="none" stroke="var(--color-background-tertiary)" strokeWidth="6" />
                  <circle
                    cx="45" cy="45" r="38"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 38 * liveAvgScore / 100} ${2 * Math.PI * 38 * (100 - liveAvgScore) / 100}`}
                    strokeLinecap="round"
                    transform="rotate(-90, 45, 45)"
                  />
                  <text x="45" y="45" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="800" fill="var(--color-text-primary)">
                    {liveAvgScore.toFixed(0)}%
                  </text>
                </svg>
              </div>
              <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", fontWeight: 600, marginTop: "6px", textAlign: "center", textTransform: "uppercase" }}>
                Live Average
              </div>
            </div>
          </div>
        </div>

        {/* Score Interpretation */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconStar size={16} style={{ color: "var(--color-primary)" }} /> Match Score Interpretation
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            <ScoreRow range="90 - 100" label="Excellent fit - highly recommended" bg="#EAF3DE" textColor="#27500A" />
            <ScoreRow range="75 - 89" label="Strong fit - ideal candidate profile" bg="#E6F1FB" textColor="#0C447C" />
            <ScoreRow range="60 - 74" label="Moderate fit - potential gap in skills" bg="#FAEEDA" textColor="#633806" />
            <ScoreRow range="< 60" label="Weak fit - not recommended for position" bg="#FCEBEB" textColor="#791F1F" />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>{getDialogTitle()} ({displayList.length})</DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body">
            <div>
              {displayList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No matches found.</div>
              ) : (
                displayList
                  .filter((c: any) => dialogType === "matches" || (dialogType === "excellent" && c.matchScore >= 90))
                  .map((candidate: any) => (
                  <div key={candidate.id} className="popup-row">
                    <div className="popup-avatar">
                      {candidate.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="popup-info">
                      <div className="popup-title">{candidate.name}</div>
                      <div className="popup-sub">
                        <IconCode size={12} />
                        {candidate.skills}
                      </div>
                    </div>
                    <div className="popup-stat" style={{ flexDirection: "row", alignItems: "center" }}>
                      <span className="popup-tag" style={{ background: candidate.matchScore >= 90 ? "var(--color-green-light)" : candidate.matchScore >= 75 ? "var(--color-blue-light)" : "var(--color-amber-light)", color: candidate.matchScore >= 90 ? "var(--color-success-dark)" : candidate.matchScore >= 75 ? "var(--color-blue-mid)" : "var(--color-warning-dark)", borderRadius: "12px", padding: "6px 12px", fontSize: "12px" }}>
                        {candidate.matchScore}% Match
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreRow({ range, label, bg, textColor }: { range: string; label: string; bg: string; textColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "var(--radius)", background: bg }}>
      <span style={{ fontSize: "11px", fontWeight: "500", color: textColor, width: "56px" }}>{range}</span>
      <span style={{ fontSize: "12px", color: textColor, flex: 1 }}>{label}</span>
    </div>
  );
}

function MarginTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"projected" | "monthly" | "breakeven" | "active">("projected");
  const [intervalVal, setIntervalVal] = useState<3 | 6 | 12>(12);

  // Interactive ROI parameters
  const [billRate, setBillRate] = useState(150);
  const [payRate, setPayRate] = useState(100);
  const hiringCost = 6000;

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <LoadingState />;

  const breakEvenMonths = stats.avgMonthlyMargin > 0 ? (6000 / stats.avgMonthlyMargin).toFixed(1) : "1.4";

  const handleKpiClick = (type: "projected" | "monthly" | "breakeven" | "active") => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "projected": return "Active Hires (Projected 12M Margin)";
      case "monthly": return "Active Hires (Monthly Margin)";
      case "breakeven": return "Active Hires (Break-even Details)";
      case "active": return "All Active Hires";
      default: return "Hires";
    }
  };

  const displayList = stats.allHires || [];

  // Live ROI Calculations
  const liveMonthlyMargin = Math.max(0, (billRate - payRate) * 160);
  const liveYearlyMargin = liveMonthlyMargin * 12;
  const liveBreakeven = liveMonthlyMargin > 0 ? (hiringCost / liveMonthlyMargin).toFixed(2) : "N/A";

  const chartData12 = [
    { month: "Mo1", margin: 8 },
    { month: "Mo2", margin: 18 },
    { month: "Mo3", margin: 30 },
    { month: "Mo4", margin: 42 },
    { month: "Mo6", margin: 55 },
    { month: "Mo8", margin: 68 },
    { month: "Mo10", margin: 82 },
    { month: "Mo12", margin: 96 },
  ];

  const chartData = intervalVal === 3 
    ? chartData12.slice(0, 3) 
    : intervalVal === 6 
      ? chartData12.slice(0, 5) 
      : chartData12;

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Margin Forecasting</span> Engine
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Financial simulations • cumulative profit projections • vendor markup breakdown
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => setIntervalVal(m as 3 | 6 | 12)}
                className="walkthrough-btn"
                style={{
                  background: intervalVal === m ? "var(--color-primary)" : "var(--color-background-secondary)",
                  color: intervalVal === m ? "#fff" : "var(--color-text-secondary)",
                  padding: "4px 10px",
                  borderRadius: "16px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                {m} Month View
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("projected")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-success)" } as React.CSSProperties}
        >
          <IconCalculator className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Projected 12M Margin</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{fmt(stats.projectedMargin)}</div>
          <div className="kpi-delta up" style={{ fontSize: "11px" }}>across active placements</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "85%", background: "var(--color-success)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("monthly")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-primary)" } as React.CSSProperties}
        >
          <IconTrendingUp className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Avg Monthly Margin</div>
          <div className="kpi-val">{fmt(stats.avgMonthlyMargin)}</div>
          <div className="kpi-delta up" style={{ fontSize: "11px" }}>per billable hire</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "70%", background: "var(--color-primary)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("breakeven")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-warning)" } as React.CSSProperties}
        >
          <IconClock className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Average Break-even</div>
          <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>{breakEvenMonths}mo</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <IconArrowUpRight size={12} /> cost recovery
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-amber-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", background: "var(--color-warning)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("active")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-purple)" } as React.CSSProperties}
        >
          <IconUsers className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Active Billed Hires</div>
          <div className="kpi-val">{stats.totalHires}</div>
          <div className="kpi-delta" style={{ fontSize: "11px" }}>margin actively forecasted</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "75%", background: "var(--color-purple)" }} />
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Interactive ROI Calculator Card */}
        <div className="glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="roi-card-header">
            <div className="card-title-wireframe" style={{ color: "#fff", marginBottom: 0 }}>
              <IconCalculator size={16} /> Live ROI & Margin Simulator
            </div>
          </div>
          <div className="roi-card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, marginBottom: "4px", color: "var(--color-text-primary)" }}>
                  <span>Bill Rate</span>
                  <span style={{ color: "var(--color-primary)" }}>${billRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={billRate}
                  onChange={(e) => setBillRate(Number(e.target.value))}
                  className="premium-slider"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, marginBottom: "4px", color: "var(--color-text-primary)" }}>
                  <span>Pay Rate</span>
                  <span style={{ color: "var(--color-purple)" }}>${payRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={payRate}
                  onChange={(e) => setPayRate(Number(Math.min(billRate - 5, Number(e.target.value))))} // Ensure pay rate is below bill rate
                  className="premium-slider"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "var(--color-background-secondary)", padding: "10px", borderRadius: "8px", border: "0.5px solid var(--color-border-tertiary)", marginTop: "4px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "9px", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>Monthly Margin</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-success-dark)", marginTop: "2px" }}>${liveMonthlyMargin.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "9px", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>12M Projected</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-success-dark)", marginTop: "2px" }}>${(liveYearlyMargin/1000).toFixed(0)}K</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "9px", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>Break-even</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2px" }}>{liveBreakeven} mo</div>
                </div>
              </div>
            </div>

            <hr className="divider" style={{ margin: "14px 0 10px" }} />

            <div className="card-title-wireframe" style={{ marginBottom: "6px" }}>
              <IconTrendingUp size={15} style={{ color: "var(--color-primary)" }} /> Cumulative Margin Growth ({intervalVal}M Projection)
            </div>
            <div className="chart-container" style={{ minHeight: "130px" }}>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value}K`, "Cumulative Margin"]}
                  />
                  <Area type="monotone" dataKey="margin" stroke="var(--color-success)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMargin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vendor Margin Breakdown */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconBuildingStore size={16} style={{ color: "var(--color-primary)" }} /> Margin contribution by Vendor Partner
          </div>
          <div className="chart-container" style={{ marginTop: "12px", minHeight: "160px" }}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats.marginByVendor.slice(0, 4).map(v => ({ name: v.vendorName.replace(" Inc", "").replace(" Solutions", ""), margin: Math.round(v.margin / 1000) }))} barCategoryGap="30%" dataKey="margin" margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value}K`, "Margin"]}
                />
                <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                  {["var(--color-primary)", "var(--color-purple)", "var(--color-success)", "var(--color-warning)"].map((color, i) => (
                    <Cell key={`cell-${i}`} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
            {stats.marginByVendor.slice(0, 4).map((v, i) => {
              const colors = ["var(--color-primary)", "var(--color-purple)", "var(--color-success)", "var(--color-warning)"];
              return (
                <div key={v.vendorId} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors[i] }} />
                  {v.vendorName.replace(" Inc", "").replace(" Solutions", "")}: {fmt(v.margin)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern markup percentage list */}
      <div className="card-wireframe glass-card-premium" style={{ marginBottom: "12px", border: "1px solid var(--color-border-tertiary)" }}>
        <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
          <IconChartBar size={16} style={{ color: "var(--color-primary)" }} /> Vendor Margin Breakdown
        </div>
        <div className="mini-bar-wrap" style={{ marginTop: "12px" }}>
            {stats.marginByVendor.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)" }}>
                No active margin contributions
              </div>
            ) : (
              stats.marginByVendor.slice(0, 4).map((v, i) => {
                const colors = ["var(--color-primary)", "var(--color-purple)", "var(--color-success)", "var(--color-warning)"];
                const maxMargin = stats.marginByVendor[0]?.margin || 1;
                const width = Math.round((v.margin / maxMargin) * 100);
                return (
                  <div key={v.vendorId} className="mini-bar-row">
                    <span className="mini-bar-label" style={{ fontSize: "12px", fontWeight: 500, width: "120px" }}>{v.vendorName.replace(" Inc", "").replace(" Solutions", "")}</span>
                    <div className="mini-track" style={{ height: "10px", borderRadius: "5px" }}>
                      <div className="mini-fill" style={{ width: `${width}%`, background: colors[i % colors.length], borderRadius: "5px" }} />
                    </div>
                    <span className="mini-val" style={{ fontSize: "12px", fontWeight: 600, minWidth: "50px", textAlign: "right" }}>{fmt(v.margin)}</span>
                  </div>
                );
              })
            )}
          </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>{getDialogTitle()} ({displayList.length})</DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body">
            <div>
              {displayList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No active hires found.</div>
              ) : (
                displayList.map((hire: any) => {
                  const monthlyMargin = hire.projectedMargin ? hire.projectedMargin / 12 : 0;
                  const hireCost = hire.hiringCost || 6000;
                  const monthsToBreakeven = monthlyMargin > 0 ? (hireCost / monthlyMargin).toFixed(1) : "N/A";
                  
                  return (
                    <div key={hire.id} className="popup-row">
                      <div className="popup-info">
                        <div className="popup-title">{hire.candidateName}</div>
                        <div className="popup-sub">
                          <IconAward size={12} style={{ color: "var(--color-primary)" }} /> {hire.demandTitle}
                          <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                          {hire.vendorName || "Internal Agency"}
                        </div>
                      </div>
                      <div className="popup-stat">
                        {dialogType === "monthly" ? (
                          <>
                            <span className="popup-stat-val" style={{ color: "var(--color-success-dark)" }}>${Math.round(monthlyMargin).toLocaleString()}/mo</span>
                            <span className="popup-stat-label">Margin</span>
                          </>
                        ) : dialogType === "breakeven" ? (
                          <>
                            <span className="popup-stat-val">{monthsToBreakeven} months</span>
                            <span className="popup-stat-label">Cost: ${hireCost.toLocaleString()}</span>
                          </>
                        ) : (
                          <>
                            <span className="popup-stat-val" style={{ color: "var(--color-success-dark)" }}>${Math.round(hire.projectedMargin || 0).toLocaleString()}</span>
                            <span className="popup-stat-label">12M Margin</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"active" | "submit" | "commission" | "pending">("active");

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <LoadingState />;

  const avgSubmitToHire = stats.allVendors.length > 0
    ? Math.round(stats.allVendors.reduce((sum, v) => sum + v.submitToHireRate, 0) / stats.allVendors.length)
    : 0;

  const totalCommissionPaid = stats.allHires.reduce((sum, h) => {
    const vendor = stats.allVendors.find((v: any) => v.name === h.vendorName);
    return sum + (vendor ? h.hiredRate * 160 * vendor.commissionRate * 12 : 0);
  }, 0);

  const handleKpiClick = (type: "active" | "submit" | "commission" | "pending") => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "active": return "Active Vendors";
      case "submit": return "Vendors (Avg Submit-to-Hire)";
      case "commission": return "Vendors (Commission Paid)";
      case "pending": return "Vendors (Pending Payouts)";
      default: return "Vendors";
    }
  };

  const displayList = stats.allVendors || [];

  // Prepare Radar Chart Data for Top 3 vendors
  const top3Vendors = [...(stats.allVendors || [])]
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 3);

  // Radar data points: Fill Speed, Hires, Score, Match Rate, Comm. Savings
  const radarData = [
    { subject: 'Fill Speed', A: 85, B: 60, C: 70 },
    { subject: 'Total Hires', A: 90, B: 75, C: 50 },
    { subject: 'Perf Score', A: 96, B: 82, C: 76 },
    { subject: 'Submit-to-Hire', A: 80, B: 70, C: 90 },
    { subject: 'Markup Score', A: 75, B: 85, C: 65 }
  ];

  if (top3Vendors.length >= 1) {
    radarData[0].A = top3Vendors[0].avgFillDays ? Math.max(10, 100 - top3Vendors[0].avgFillDays * 1.5) : 80;
    radarData[1].A = Math.min(100, (top3Vendors[0].hiresCount || 0) * 10);
    radarData[2].A = Math.min(100, (top3Vendors[0].performanceScore || 0) * 20);
    radarData[3].A = top3Vendors[0].submitToHireRate || 50;
    radarData[4].A = Math.max(10, 100 - (top3Vendors[0].commissionRate || 0.15) * 400);
  }
  if (top3Vendors.length >= 2) {
    radarData[0].B = top3Vendors[1].avgFillDays ? Math.max(10, 100 - top3Vendors[1].avgFillDays * 1.5) : 70;
    radarData[1].B = Math.min(100, (top3Vendors[1].hiresCount || 0) * 10);
    radarData[2].B = Math.min(100, (top3Vendors[1].performanceScore || 0) * 20);
    radarData[3].B = top3Vendors[1].submitToHireRate || 50;
    radarData[4].B = Math.max(10, 100 - (top3Vendors[1].commissionRate || 0.15) * 400);
  }
  if (top3Vendors.length >= 3) {
    radarData[0].C = top3Vendors[2].avgFillDays ? Math.max(10, 100 - top3Vendors[2].avgFillDays * 1.5) : 60;
    radarData[1].C = Math.min(100, (top3Vendors[2].hiresCount || 0) * 10);
    radarData[2].C = Math.min(100, (top3Vendors[2].performanceScore || 0) * 20);
    radarData[3].C = top3Vendors[2].submitToHireRate || 50;
    radarData[4].C = Math.max(10, 100 - (top3Vendors[2].commissionRate || 0.15) * 400);
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "✨";
    }
  };

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Vendor Performance</span> Hub
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Partner scorecards • submission conversions • automated commission and payouts tracking
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              Vendor Gateways Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("active")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-primary)" } as React.CSSProperties}
        >
          <IconBuilding className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Active Vendors</div>
          <div className="kpi-val">{stats.totalVendors}</div>
          <div className="kpi-delta up" style={{ fontSize: "11px" }}>integrated suppliers</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "80%", background: "var(--color-primary)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("submit")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-purple)" } as React.CSSProperties}
        >
          <IconAward className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Avg Submit-to-Hire</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>{avgSubmitToHire}%</div>
          <div className="kpi-delta up" style={{ fontSize: "11px", color: "var(--color-purple)" }}>industry avg 18%</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${avgSubmitToHire}%`, background: "var(--color-purple)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("commission")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-success)" } as React.CSSProperties}
        >
          <IconCalculator className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Commission Paid</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{fmt(totalCommissionPaid)}</div>
          <div className="kpi-delta up" style={{ fontSize: "11px" }}>cumulative agency fees</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "70%", background: "var(--color-success)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card"
          onClick={() => handleKpiClick("pending")}
          style={{ cursor: "pointer", "--kpi-color": "var(--color-warning)" } as React.CSSProperties}
        >
          <IconClock className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Pending Payouts</div>
          <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>{fmt(totalCommissionPaid * 0.15)}</div>
          <div className="kpi-delta down" style={{ fontSize: "11px" }}>accruing net 30 invoices</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-amber-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "45%", background: "var(--color-warning)" }} />
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Leaderboard Scorecard */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconBuilding size={16} style={{ color: "var(--color-primary)" }} /> Supplier Leaderboard
          </div>
          <div className="vendor-list" style={{ marginTop: "12px" }}>
            {stats.allVendors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                No vendor data populated
              </div>
            ) : (
              [...(stats.allVendors || [])]
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .map((vendor: any, index: number) => (
                <div key={vendor.id} className="vendor-row premium-interactive-row" style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: "16px", marginRight: "4px", fontWeight: "bold" }}>
                    {getRankBadge(index)}
                  </div>
                  <div
                    className="cand-avatar"
                    style={{ background: "var(--color-blue-light)", color: "var(--color-primary)", width: "30px", height: "30px", fontSize: "11px" }}
                  >
                    {vendor.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vendor.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>
                      Comm: {(vendor.commissionRate * 100).toFixed(0)}% • {vendor.hiresCount} hires • Fill: {vendor.avgFillDays || 0}d
                    </div>
                  </div>
                  <div className="mini-track" style={{ width: "60px", height: "8px" }}>
                    <div
                      className="mini-fill"
                      style={{
                        width: `${vendor.performanceScore * 20}%`,
                        background: vendor.performanceScore >= 4 ? "var(--color-success)" : vendor.performanceScore >= 3 ? "var(--color-warning)" : "var(--color-error)"
                      }}
                    />
                  </div>
                  <div className="vendor-score" style={{ fontSize: "12px", fontWeight: 700, color: vendor.performanceScore >= 4 ? "var(--color-success-dark)" : vendor.performanceScore >= 3 ? "var(--color-warning-dark)" : "var(--color-error-dark)" }}>
                    {vendor.performanceScore.toFixed(1)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vendor Radar Comparison */}
        <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
          <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px" }}>
            <IconStar size={16} style={{ color: "var(--color-purple)" }} /> Multidimensional Comparison (Top 3)
          </div>
          <div className="chart-container" style={{ marginTop: "12px", height: "200px" }}>
            {top3Vendors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                Need active vendor scorecards to draw radar chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--color-border-tertiary)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  {top3Vendors.length >= 1 && (
                    <Radar name={top3Vendors[0].name.substring(0, 12)} dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
                  )}
                  {top3Vendors.length >= 2 && (
                    <Radar name={top3Vendors[1].name.substring(0, 12)} dataKey="B" stroke="var(--color-purple)" fill="var(--color-purple)" fillOpacity={0.15} />
                  )}
                  {top3Vendors.length >= 3 && (
                    <Radar name={top3Vendors[2].name.substring(0, 12)} dataKey="C" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.15} />
                  )}
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "8px",
                      fontSize: "10px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "9px", marginTop: "10px" }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>{getDialogTitle()} ({displayList.length})</DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body">
            <div>
              {displayList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No vendors found.</div>
              ) : (
                displayList.map((vendor: any) => {
                  const comm = vendor.commissionRate * 100;
                  return (
                    <div key={vendor.id} className="popup-row">
                      <div className="popup-avatar">
                        {vendor.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title">{vendor.name}</div>
                        <div className="popup-sub">
                          <IconBuildingStore size={12} /> {vendor.contact || "No Contact info"}
                          <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                          {vendor.email || "No email"}
                        </div>
                      </div>
                      <div className="popup-stat">
                        {dialogType === "submit" ? (
                          <>
                            <span className="popup-stat-val">{vendor.submitToHireRate}%</span>
                            <span className="popup-stat-label">Submit-to-Hire</span>
                          </>
                        ) : dialogType === "commission" || dialogType === "pending" ? (
                          <>
                            <span className="popup-stat-val">{comm.toFixed(1)}%</span>
                            <span className="popup-stat-label">Rate</span>
                          </>
                        ) : (
                          <>
                            <span className="popup-stat-val" style={{ color: vendor.performanceScore >= 4 ? "var(--color-success-dark)" : vendor.performanceScore >= 3 ? "var(--color-warning-dark)" : "var(--color-error-dark)" }}>
                              {vendor.performanceScore.toFixed(1)} / 5.0
                            </span>
                            <span className="popup-stat-label">Score</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



function ProjectsTab() {
  const [candidatesWithProjects, setCandidatesWithProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/candidates-with-projects")
      .then(res => res.json())
      .then(data => setCandidatesWithProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);



  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (loading) return <LoadingState />;

  const totalCandidates = candidatesWithProjects.length;
  const candidatesWithHires = candidatesWithProjects.filter((c: any) => c.hires && c.hires.length > 0).length;
  const totalActiveProjects = candidatesWithProjects.reduce((sum: number, c: any) => sum + (c.hires?.filter((h: any) => h.status === "ACTIVE").length || 0), 0);
  const totalMargin = candidatesWithProjects.reduce((sum: number, c: any) => sum + (c.hires?.reduce((hSum: number, h: any) => hSum + (h.projectedMargin12m || 0), 0) || 0), 0);

  const HIRE_STATUS_COLORS: Record<string, string> = {
    ACTIVE: "tag tag-green",
    COMPLETED: "tag tag-blue",
    CANCELLED: "tag tag-gray",
  };

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Candidate Projects</span> Allocation
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Active client billings • candidate utilization status • financial returns across client projects
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              Allocation Monitor Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-primary)" } as React.CSSProperties}>
          <IconUsers className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Total Candidates</div>
          <div className="kpi-val">{totalCandidates}</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "90%", background: "var(--color-primary)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-purple)" } as React.CSSProperties}>
          <IconBriefcase className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Candidates Billed</div>
          <div className="kpi-val">{candidatesWithHires}</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totalCandidates ? (candidatesWithHires / totalCandidates) * 100 : 60}%`, background: "var(--color-purple)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
          <IconListCheck className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Active Placements</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{totalActiveProjects}</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${candidatesWithHires ? (totalActiveProjects / candidatesWithHires) * 100 : 80}%`, background: "var(--color-success)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-warning)" } as React.CSSProperties}>
          <IconCalculator className="premium-kpi-icon" size={44} />
          <div className="kpi-label">Total 12M Margin</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{formatCurrency(totalMargin)}</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-amber-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "85%", background: "var(--color-warning)" }} />
          </div>
        </div>
      </div>

      <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)", padding: "16px" }}>
        <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px", marginBottom: "12px" }}>
          <IconBriefcase size={16} style={{ color: "var(--color-primary)" }} /> Active Candidate Project Allocations ({candidatesWithProjects.length})
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                {["Candidate Profile", "Contact Info", "Primary Skills", "Exp", "Bill Status", "Project Details & Utilization", "Allocations"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidatesWithProjects.map((candidate: any) => (
                <React.Fragment key={candidate.id}>
                  <tr style={{ borderBottom: "1px solid var(--color-border-tertiary)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background-secondary)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                    <td style={{ padding: "12px 8px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {candidate.hotTalent && <IconFlame size={14} style={{ color: "#EF9F27" }} />}
                        {candidate.name}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{candidate.email}</div>
                      {candidate.phone && (
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{candidate.phone}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {Array.from(new Set(parseSkills(candidate.extractedSkills))).slice(0, 2).map((skill: string) => (
                          <span key={skill} className="tag tag-blue" style={{ fontSize: "10px", padding: "2px 6px" }}>{skill}</span>
                        ))}
                        {parseSkills(candidate.extractedSkills).length > 2 && (
                          <span className="tag" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)", fontSize: "10px", padding: "2px 6px" }}>+{parseSkills(candidate.extractedSkills).length - 2}</span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontWeight: 500 }}>{candidate.experienceYears} yrs</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span className="tag tag-blue" style={{ fontSize: "10px" }}>{candidate.status}</span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {candidate.hires && candidate.hires.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "340px" }}>
                          {candidate.hires.slice(0, 2).map((hire: any) => {
                            const isProjectActive = hire.status === "ACTIVE";
                            return (
                              <div key={hire.id} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "6px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--radius)", border: "0.5px solid var(--color-border-tertiary)", fontSize: "11px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                                    <IconBriefcase size={12} style={{ color: "var(--color-primary)" }} />
                                    {hire.demand?.title || "Contract Role"}
                                  </div>
                                  <span className={HIRE_STATUS_COLORS[hire.status] || "tag"} style={{ fontSize: "9px", padding: "1px 5px" }}>{hire.status}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", fontSize: "10px" }}>
                                  <span>Rate: ${hire.hiredRate}/hr</span>
                                  <span>Proj: {formatCurrency(hire.projectedMargin12m || 0)}</span>
                                </div>
                                {/* Utilization bar */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <div style={{ flex: 1, height: "4px", background: "var(--color-border-tertiary)", borderRadius: "2px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: isProjectActive ? "100%" : hire.status === "COMPLETED" ? "100%" : "0%", background: isProjectActive ? "var(--color-success)" : hire.status === "COMPLETED" ? "var(--color-primary)" : "var(--color-text-tertiary)" }} />
                                  </div>
                                  <span style={{ fontSize: "8px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                                    {isProjectActive ? "100% UT" : hire.status === "COMPLETED" ? "100% UT" : "0% UT"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {candidate.hires.length > 2 && (
                            <button
                              onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--color-primary)", fontSize: "11px", fontWeight: 600, textAlign: "left", padding: "2px 0 0 0"
                              }}
                            >
                              +{candidate.hires.length - 2} more projects
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-text-tertiary)", fontSize: "11px", fontStyle: "italic" }}>No active projects billed</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        className="tag"
                        style={{
                          background: candidate.hires?.length > 0 ? "var(--color-green-light)" : "var(--color-background-secondary)",
                          color: candidate.hires?.length > 0 ? "var(--color-success-dark)" : "var(--color-text-tertiary)",
                          fontWeight: 700,
                          fontSize: "11px",
                          padding: "3px 8px"
                        }}
                      >
                        {candidate.hires?.length || 0} active
                      </span>
                    </td>
                  </tr>
                  {expandedCandidate === candidate.id && candidate.hires?.length > 2 && (
                    <tr key={`${candidate.id}-expanded`}>
                      <td colSpan={7} style={{ padding: "12px", background: "var(--color-background-secondary)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                          {candidate.hires.slice(2).map((hire: any) => (
                            <div key={hire.id} style={{ padding: "10px", background: "var(--color-background-primary)", borderRadius: "var(--radius)", border: "0.5px solid var(--color-border-tertiary)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <IconBriefcase size={14} style={{ color: "var(--color-primary)" }} />
                                <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "12px" }}>{hire.demand?.title || "Contract Role"}</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px" }}>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Rate:</span>
                                  <span style={{ color: "var(--color-text-secondary)", marginLeft: "4px", fontWeight: 500 }}>${hire.hiredRate}/hr</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Status:</span>
                                  <span className={HIRE_STATUS_COLORS[hire.status]} style={{ marginLeft: "4px", fontSize: "9px" }}>{hire.status}</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Margin:</span>
                                  <span style={{ color: "var(--color-success-dark)", marginLeft: "4px", fontWeight: 600 }}>{formatCurrency(hire.projectedMargin12m || 0)}</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Vendor:</span>
                                  <span style={{ color: "var(--color-text-secondary)", marginLeft: "4px", fontWeight: 500 }}>{hire.vendor?.name || "Internal Direct"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {candidatesWithProjects.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No candidates yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
