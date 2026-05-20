"use client";

import { useEffect, useState } from "react";
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
} from "@tabler/icons-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import PipelineTab from "./PipelineTab";
import SkillGapTab from "./SkillGapTab";
import ActivityTab from "./ActivityTab";
import CreateDemandTab from "./CreateDemandTab";

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

export default function DashboardPage() {
  const { activeTab } = useTab();

  return (
    <>
      {activeTab === "demand" && <DemandTab />}
      {activeTab === "supply" && <SupplyTab />}
      {activeTab === "matching" && <MatchingTab />}
      {activeTab === "margin" && <MarginTab />}
      {activeTab === "vendor" && <VendorTab />}
      {activeTab === "projects" && <ProjectsTab />}
      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "skillgap" && <SkillGapTab />}
      {activeTab === "activity" && <ActivityTab />}
      {activeTab === "createDemand" && <CreateDemandTab />}
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
      <div className="page-title">Demand Dashboard</div>
      <div className="page-sub">Open job pipeline · revenue at risk · aging alerts</div>

      <div className="kpi-grid">
        <div 
          className="kpi" 
          onClick={handleOpenDemandsClick}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Open Demands</div>
          <div className="kpi-val">{stats.openDemands}</div>
          <div className="kpi-delta up">
            <IconArrowUpRight size={12} /> {stats.totalDemands} total
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Revenue at Risk</div>
          <div className="kpi-val">{fmt(stats.revenueAtRisk)}</div>
          <div className="kpi-delta down">
            <IconArrowDownRight size={12} /> {stats.openDemands} unfilled
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Time-to-Fill</div>
          <div className="kpi-val">{stats.avgTimeToFill || 9}d</div>
          <div className="kpi-delta up">
            <IconArrowUpRight size={12} /> vs 44d manual
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Hot Demands</div>
          <div className="kpi-val">{stats.hotDemands.length}</div>
          <div className="kpi-delta down">
            <IconAlertCircle size={12} /> {"aging >7d"}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconChartBar size={15} /> Hiring Pipeline Funnel
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[
                { name: "Applied", count: 142, fill: "#185FA5" },
                { name: "Screened", count: 108, fill: "#378ADD" },
                { name: "Interview", count: 64, fill: "#85B7EB" },
                { name: "Offer", count: 31, fill: "#B5D4F4" },
                { name: "Hired", count: 20, fill: "#639922" },
              ]} barCategoryGap="20%" dataKey="count">
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {["#185FA5", "#378ADD", "#85B7EB", "#B5D4F4", "#639922"].map((color, i) => (
                    <Cell key={`cell-${i}`} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", padding: "0 8px" }}>
            {[
              { label: "Applied", count: 142, color: "#185FA5" },
              { label: "Screened", count: 108, color: "#378ADD" },
              { label: "Interview", count: 64, color: "#85B7EB" },
              { label: "Offer", count: 31, color: "#B5D4F4" },
              { label: "Hired", count: 20, color: "#639922" },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: item.color }}>{item.count}</div>
                <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconFlame size={15} /> Hot Demands · Priority View
          </div>
          <div className="demand-list">
            {stats.hotDemands.length === 0 ? (
              <div className="demand-row" style={{ justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                No hot demands
              </div>
            ) : (
              stats.hotDemands.slice(0, 5).map(demand => (
                <div key={demand.id} className="demand-row">
                  <div
                    className="priority-dot"
                    style={{ background: demand.priority === "HIGH" ? "#E24B4A" : demand.priority === "MEDIUM" ? "#EF9F27" : "#639922" }}
                  />
                  <span className="demand-title">{demand.title}</span>
                  <span className={`tag ${demand.priority === "HIGH" ? "tag-red" : demand.priority === "MEDIUM" ? "tag-amber" : "tag-green"}`}>
                    {demand.priority === "HIGH" ? "Hot" : demand.priority === "MEDIUM" ? "Mid" : "Low"}
                  </span>
                  <span className="days">{demand.daysAging}d</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>All Open Demands</DialogTitle>
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
                  openDemandsList.map(demand => (
                    <div key={demand.id} className="popup-row">
                      <div
                        className="popup-avatar small"
                        style={{ background: demand.priority === "HIGH" ? "var(--color-error)" : demand.priority === "MEDIUM" ? "var(--color-warning)" : "var(--color-success)" }}
                      />
                      <div className="popup-info">
                        <div className="popup-title">{demand.title}</div>
                        <div className="popup-sub">
                          <IconBuildingStore size={12} /> {demand.vendor?.name || "Internal"}
                          <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                          {demand.location || "Remote"}
                        </div>
                      </div>
                      <div className="popup-stat" style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}>
                        <span className="popup-tag" style={{ background: demand.priority === "HIGH" ? "var(--color-red-light)" : demand.priority === "MEDIUM" ? "var(--color-amber-light)" : "var(--color-green-light)", color: demand.priority === "HIGH" ? "var(--color-error-dark)" : demand.priority === "MEDIUM" ? "var(--color-warning-dark)" : "var(--color-success-dark)" }}>
                          {demand.priority === "HIGH" ? "Hot" : demand.priority === "MEDIUM" ? "Mid" : "Low"}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", minWidth: "80px", textAlign: "right" }}>
                          ${demand.rateMin}-{demand.rateMax}/hr
                        </span>
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
      <div className="page-title">Supply Dashboard</div>
      <div className="page-sub">Talent pool · skill breakdown · hot talent list</div>

      <div className="kpi-grid">
        <div 
          className="kpi" 
          onClick={() => handleKpiClick("total")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Total Candidates</div>
          <div className="kpi-val">{stats.totalCandidates}</div>
          <div className="kpi-delta up">
            <IconArrowUpRight size={12} /> 23 this month
          </div>
        </div>
        <div 
          className="kpi" 
          onClick={() => handleKpiClick("hot")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Hot Talent</div>
          <div className="kpi-val">{stats.hotTalentCount}</div>
          <div className="kpi-delta up">
            <IconStar size={12} /> auto-flagged
          </div>
        </div>
        <div 
          className="kpi" 
          onClick={() => handleKpiClick("available")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Available Now</div>
          <div className="kpi-val">{stats.availableNow}</div>
          <div className="kpi-delta up">
            <IconClock size={12} /> immediate
          </div>
        </div>
        <div 
          className="kpi" 
          onClick={() => handleKpiClick("matches")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Avg Match Score</div>
          <div className="kpi-val">{stats.avgMatchScore.toFixed(0)}</div>
          <div className="kpi-delta up">
            <IconArrowUpRight size={12} /> /100
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconChartPie size={15} /> Talent Pool by Skill
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.skillDistribution.slice(0, 5)}
                  dataKey="count"
                  nameKey="skill"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {["#185FA5", "#378ADD", "#534AB7", "#1D9E75", "#D85A30"].map((color, i) => (
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
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px", justifyContent: "center" }}>
            {stats.skillDistribution.slice(0, 5).map((item, i) => {
              const colors = ["#185FA5", "#378ADD", "#534AB7", "#1D9E75", "#D85A30"];
              return (
                <div key={item.skill} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--color-text-secondary)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: colors[i] }} />
                  {item.skill}: {item.count}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconStar size={15} /> Hot Talent · Top Matches
          </div>
          <div className="candidate-list">
            {stats.hotTalents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)" }}>
                No hot talent
              </div>
            ) : (
              stats.hotTalents.slice(0, 4).map(talent => (
                <div key={talent.id} className="cand-row">
                  <div
                    className="cand-avatar"
                    style={{ background: "#E6F1FB", color: "#185FA5" }}
                  >
                    {talent.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="cand-name">{talent.name}</div>
                    <div className="cand-skills">{talent.skills}</div>
                  </div>
                  <span className={`score-pill ${talent.matchScore >= 85 ? "score-high" : "score-mid"}`}>
                    {talent.matchScore}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                          {candidate.skills || (typeof candidate.extractedSkills === "string" ? JSON.parse(candidate.extractedSkills || "[]").slice(0, 3).join(" · ") : "N/A")}
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

  return (
    <div>
      <div className="page-title">AI Role Matching Engine</div>
      <div className="page-sub">Weighted composite scoring · semantic embeddings · batch processing</div>

      <div className="kpi-grid">
        <div 
          className="kpi"
          onClick={() => handleKpiClick("matches")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Matches Today</div>
          <div className="kpi-val">{stats.matchesToday}</div>
          <div className="kpi-delta up">
            <IconBolt size={12} /> auto-processed
          </div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("excellent")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Excellent Fits</div>
          <div className="kpi-val">{stats.excellentFits}</div>
          <div className="kpi-delta">score &ge; 90</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Score</div>
          <div className="kpi-val">{stats.avgMatchScore.toFixed(1)}</div>
          <div className="kpi-delta">/100 composite</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Processing Time</div>
          <div className="kpi-val">{stats.processingTime.toFixed(1)}s</div>
          <div className="kpi-delta up">
            <IconArrowUpRight size={12} /> per candidate
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconCode size={15} /> Scoring Algorithm · Weight Breakdown
          </div>
          <div className="algo-steps">
            <div className="algo-step">
              <div className="step-num" style={{ background: "#E6F1FB", color: "#185FA5" }}>1</div>
              <div>
                <div className="step-title">Skill Overlap</div>
                <div className="step-sub">Intersection of candidate skills vs required skills · exact + semantic matching via embeddings</div>
              </div>
              <span className="weight-badge" style={{ background: "#E6F1FB", color: "#185FA5" }}>50%</span>
            </div>
            <div className="algo-step">
              <div className="step-num" style={{ background: "#EEEDFE", color: "#534AB7" }}>2</div>
              <div>
                <div className="step-title">Experience Fit</div>
                <div className="step-sub">Deviation from required years · normalized 0-1 · penalizes over/under by same function</div>
              </div>
              <span className="weight-badge" style={{ background: "#EEEDFE", color: "#534AB7" }}>30%</span>
            </div>
            <div className="algo-step">
              <div className="step-num" style={{ background: "#E1F5EE", color: "#0F6E56" }}>3</div>
              <div>
                <div className="step-title">Rate Compatibility</div>
                <div className="step-sub">Expected CTC within bill-rate band · proportional penalty for deviation outside range</div>
              </div>
              <span className="weight-badge" style={{ background: "#E1F5EE", color: "#0F6E56" }}>20%</span>
            </div>
          </div>
        </div>

        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconAward size={15} /> Score Interpretation
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <ScoreRow range="90 â€“ 100" label="Excellent fit â€” highly recommended" bg="#EAF3DE" textColor="#27500A" />
            <ScoreRow range="75 â€“ 89" label="Strong fit â€” good candidate" bg="#E6F1FB" textColor="#0C447C" />
            <ScoreRow range="60 â€“ 74" label="Moderate fit â€” may need upskilling" bg="#FAEEDA" textColor="#633806" />
            <ScoreRow range="< 60" label="Weak fit â€” not recommended" bg="#FCEBEB" textColor="#791F1F" />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
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

  return (
    <div>
      <div className="page-title">Margin Forecasting Engine</div>
      <div className="page-sub">12-month projections · break-even analysis · per-hire margin cards</div>

      <div className="kpi-grid">
        <div 
          className="kpi"
          onClick={() => handleKpiClick("projected")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Projected 12M Margin</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{fmt(stats.projectedMargin)}</div>
          <div className="kpi-delta up">across active hires</div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("monthly")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Avg Monthly Margin</div>
          <div className="kpi-val">{fmt(stats.avgMonthlyMargin)}</div>
          <div className="kpi-delta">per hire</div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("breakeven")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Break-even</div>
          <div className="kpi-val">{breakEvenMonths}mo</div>
          <div className="kpi-delta up">
            <IconArrowUpRight size={12} /> recover cost
          </div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("active")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Active Hires</div>
          <div className="kpi-val">{stats.totalHires}</div>
          <div className="kpi-delta">forecasted</div>
        </div>
      </div>

      <div className="two-col">
        <div className="margin-card">
          <div className="card-title-wireframe">
            <IconCalculator size={15} /> Example Hire · Margin Card
          </div>
          <div className="margin-row">
            <div className="margin-item">
              <div className="m-label">Bill Rate</div>
              <div className="m-val">$150/hr</div>
            </div>
            <div className="margin-item">
              <div className="m-label">Pay Rate</div>
              <div className="m-val">$100/hr</div>
            </div>
            <div className="margin-item">
              <div className="m-label">Hiring Cost</div>
              <div className="m-val">$6,000</div>
            </div>
          </div>
          <hr className="divider" />
          <div className="margin-row">
            <div className="margin-item">
              <div className="m-label">Monthly Margin</div>
              <div className="m-val green">$8,000</div>
            </div>
            <div className="margin-item">
              <div className="m-label">12M Projection</div>
              <div className="m-val green">$96K</div>
            </div>
            <div className="margin-item">
              <div className="m-label">Break-even</div>
              <div className="m-val">0.75 mo</div>
            </div>
          </div>
          <hr className="divider" />
          <div className="card-title-wireframe" style={{ marginBottom: "6px" }}>
            <IconTrendingUp size={15} /> Cumulative Margin Growth (12M)
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={[
                { month: "Mo1", margin: 8 },
                { month: "Mo2", margin: 18 },
                { month: "Mo3", margin: 30 },
                { month: "Mo6", margin: 55 },
                { month: "Mo9", margin: 78 },
                { month: "Mo12", margin: 96 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value}K`, "Cumulative Margin"]}
                />
                <Line type="monotone" dataKey="margin" stroke="#185FA5" strokeWidth={2} dot={{ fill: "#185FA5", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-wireframe">
          <div className="card-title-wireframe">
            <IconBuildingStore size={15} /> Margin by vendor
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.marginByVendor.slice(0, 4).map(v => ({ name: v.vendorName.replace(" Inc", "").replace(" Solutions", ""), margin: Math.round(v.margin / 1000) }))} barCategoryGap="30%" dataKey="margin">
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
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
                  {["#185FA5", "#534AB7", "#1D9E75", "#EF9F27"].map((color, i) => (
                    <Cell key={`cell-${i}`} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px", justifyContent: "center" }}>
            {stats.marginByVendor.slice(0, 4).map((v, i) => {
              const colors = ["#185FA5", "#534AB7", "#1D9E75", "#EF9F27"];
              return (
                <div key={v.vendorId} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", color: "var(--color-text-secondary)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: colors[i] }} />
                  {v.vendorName.replace(" Inc", "").replace(" Solutions", "")}: {fmt(v.margin)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-wireframe" style={{ marginBottom: "12px" }}>
        <div className="card-title-wireframe">
          <IconChartBar size={15} /> Margin by Vendor (Bar Chart)
        </div>
        <div className="mini-bar-wrap">
            {stats.marginByVendor.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)" }}>
                No margin data
              </div>
            ) : (
              stats.marginByVendor.slice(0, 4).map((v, i) => {
                const colors = ["#185FA5", "#534AB7", "#1D9E75", "#EF9F27"];
                const maxMargin = stats.marginByVendor[0]?.margin || 1;
                const width = Math.round((v.margin / maxMargin) * 100);
                return (
                  <div key={v.vendorId} className="mini-bar-row">
                    <span className="mini-bar-label">{v.vendorName.replace(" Inc", "").replace(" Solutions", "")}</span>
                    <div className="mini-track">
                      <div className="mini-fill" style={{ width: `${width}%`, background: colors[i % colors.length] }} />
                    </div>
                    <span className="mini-val">{fmt(v.margin)}</span>
                  </div>
                );
              })
            )}
          </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                          <IconAward size={12} /> {hire.demandTitle}
                          <span style={{ color: "var(--color-border-tertiary)" }}>•</span>
                          {hire.vendorName || "Internal"}
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

  return (
    <div>
      <div className="page-title">Vendor Management</div>
      <div className="page-sub">Performance scorecards · commission tracking · portal access</div>

      <div className="kpi-grid">
        <div 
          className="kpi"
          onClick={() => handleKpiClick("active")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Active Vendors</div>
          <div className="kpi-val">{stats.totalVendors}</div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("submit")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Avg Submit-to-Hire</div>
          <div className="kpi-val">{avgSubmitToHire}%</div>
          <div className="kpi-delta up">industry avg 18%</div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("commission")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Commission Paid</div>
          <div className="kpi-val">{fmt(totalCommissionPaid)}</div>
        </div>
        <div 
          className="kpi"
          onClick={() => handleKpiClick("pending")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
        >
          <div className="kpi-label">Pending Payouts</div>
          <div className="kpi-val">{fmt(totalCommissionPaid * 0.15)}</div>
        </div>
      </div>

      <div className="card-wireframe">
        <div className="card-title-wireframe">
          <IconBuilding size={15} /> Vendor Performance Scorecard
        </div>
        <div className="vendor-list">
          {stats.allVendors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)" }}>
              No vendors
            </div>
          ) : (
            stats.allVendors.map((vendor: any) => (
              <div key={vendor.id} className="vendor-row">
                <div
                  className="cand-avatar"
                  style={{ background: "#E6F1FB", color: "#185FA5", width: "32px", height: "32px", fontSize: "11px" }}
                >
                  {vendor.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "var(--color-text-primary)" }}>{vendor.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    Commission {(vendor.commissionRate * 100).toFixed(0)}% · {vendor.hiresCount} hires · Avg fill {vendor.avgFillDays || 0}d
                  </div>
                </div>
                <div className="mini-track" style={{ width: "80px" }}>
                  <div
                    className="mini-fill"
                    style={{
                      width: `${vendor.performanceScore * 20}%`,
                      background: vendor.performanceScore >= 4 ? "#639922" : vendor.performanceScore >= 3 ? "#EF9F27" : "#E24B4A"
                    }}
                  />
                </div>
                <div className="vendor-score" style={{ color: vendor.performanceScore >= 4 ? "#3B6D11" : vendor.performanceScore >= 3 ? "#854F0B" : "#A32D2D" }}>
                  {vendor.performanceScore.toFixed(1)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                          <IconBuildingStore size={12} /> {vendor.contact || "N/A"}
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

  const parseSkills = (skills: string | string[]): string[] => {
    if (Array.isArray(skills)) return skills;
    try { const parsed = JSON.parse(skills); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  };

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
      <div className="page-title">Candidate Projects</div>
      <div className="page-sub">All candidates with their respective billed projects</div>

      <div className="kpi-grid" style={{ marginBottom: "16px" }}>
        <div className="kpi">
          <div className="kpi-label">Total Candidates</div>
          <div className="kpi-val">{totalCandidates}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Candidates with Projects</div>
          <div className="kpi-val">{candidatesWithHires}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active Projects</div>
          <div className="kpi-val">{totalActiveProjects}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total 12M Margin</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{formatCurrency(totalMargin)}</div>
        </div>
      </div>

      <div className="card-wireframe">
        <div className="card-title-wireframe" style={{ marginBottom: "8px" }}>
          <IconBriefcase size={15} style={{ color: "var(--color-primary)" }} /> All Candidates with Projects ({candidatesWithProjects.length})
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Candidate", "Contact", "Skills", "Exp", "Status", "Projects (Billed In)", "Count"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidatesWithProjects.map((candidate: any) => (
                <>
                  <tr key={candidate.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "8px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {candidate.hotTalent && <IconFlame size={14} style={{ color: "#EF9F27" }} />}
                        {candidate.name}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{candidate.email}</div>
                      {candidate.phone && (
                        <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{candidate.phone}</div>
                      )}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {Array.from(new Set(parseSkills(candidate.extractedSkills))).slice(0, 2).map((skill: string) => (
                          <span key={skill} className="tag tag-blue">{skill}</span>
                        ))}
                        {parseSkills(candidate.extractedSkills).length > 2 && (
                          <span className="tag" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>+{parseSkills(candidate.extractedSkills).length - 2}</span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>{candidate.experienceYears}y</td>
                    <td style={{ padding: "8px" }}>
                      <span className="tag tag-blue">{candidate.status}</span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      {candidate.hires && candidate.hires.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "300px" }}>
                          {candidate.hires.slice(0, 2).map((hire: any) => (
                            <div key={hire.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", background: "var(--color-background-secondary)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                              <IconBriefcase size={12} style={{ color: "var(--color-primary)" }} />
                              <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{hire.demand?.title || "N/A"}</span>
                              <span style={{ color: "var(--color-text-secondary)" }}>${hire.hiredRate}/hr</span>
                              <span className={HIRE_STATUS_COLORS[hire.status] || "tag"}>{hire.status}</span>
                            </div>
                          ))}
                          {candidate.hires.length > 2 && (
                            <button
                              onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--color-primary)", fontSize: "11px", textAlign: "left", padding: "0"
                              }}
                            >
                              +{candidate.hires.length - 2} more
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>No projects yet</span>
                      )}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        className="tag"
                        style={{
                          background: candidate.hires?.length > 0 ? "var(--color-green-light)" : "var(--color-background-secondary)",
                          color: candidate.hires?.length > 0 ? "var(--color-success-dark)" : "var(--color-text-tertiary)"
                        }}
                      >
                        {candidate.hires?.length || 0}
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
                                <span style={{ fontWeight: 500, color: "var(--color-text-primary)", fontSize: "12px" }}>{hire.demand?.title || "N/A"}</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px" }}>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Rate:</span>
                                  <span style={{ color: "var(--color-text-secondary)", marginLeft: "4px" }}>${hire.hiredRate}/hr</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Status:</span>
                                  <span className={HIRE_STATUS_COLORS[hire.status]} style={{ marginLeft: "4px" }}>{hire.status}</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Margin:</span>
                                  <span style={{ color: "var(--color-success-dark)", marginLeft: "4px" }}>{formatCurrency(hire.projectedMargin12m || 0)}</span>
                                </div>
                                <div>
                                  <span style={{ color: "var(--color-text-tertiary)" }}>Vendor:</span>
                                  <span style={{ color: "var(--color-text-secondary)", marginLeft: "4px" }}>{hire.vendor?.name || "Internal"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
