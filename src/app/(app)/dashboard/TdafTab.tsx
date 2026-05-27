"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  IconGauge, 
  IconBriefcase, 
  IconUsers, 
  IconBuildingStore, 
  IconCoins,
  IconClock,
  IconAlertCircle,
  IconScale,
  IconArrowUpRight,
  IconChecklist,
  IconCalendarEvent,
  IconDeviceAnalytics,
  IconSearch,
  IconSparkles,
  IconFilter,
  IconChevronRight,
  IconPlus,
  IconCheck,
  IconX,
  IconSend,
  IconArrowDownRight,
  IconTrendingUp,
  IconMail,
  IconDotsVertical,
  IconPhone,
  IconUserCheck,
  IconAward,
  IconAlertTriangle,
  IconMessage,
  IconBook
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
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from "recharts";

// Robust JSON / skills parsing utility
function safeParseSkills(skills: string | string[] | null | undefined): string[] {
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

export default function TdafTab() {
  const [stats, setStats] = useState<any | null>(null);
  const [demands, setDemands] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");

  // Interaction / Filter States
  const [demandSearch, setDemandSearch] = useState<string>("");
  const [demandPriority, setDemandPriority] = useState<string>("ALL");
  const [benchSearch, setBenchSearch] = useState<string>("");
  const [vendorSearch, setVendorSearch] = useState<string>("");
  
  // Selected matches and AI Email Builder states
  const [selectedDemandForAI, setSelectedDemandForAI] = useState<any | null>(null);
  const [selectedBenchForAI, setSelectedBenchForAI] = useState<any | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Pre-onboarding checklist mock tracker
  const [onboardingChecks, setOnboardingChecks] = useState<Record<string, Record<string, boolean>>>({
    "1": { contractSigned: true, bgCheck: true, hardwareShipped: false, welcomeCall: true },
    "2": { contractSigned: true, bgCheck: false, hardwareShipped: false, welcomeCall: false },
    "3": { contractSigned: true, bgCheck: true, hardwareShipped: true, welcomeCall: true }
  });

  // Dynamic status modifier tracker for DEMANDS
  const [demandsState, setDemandsState] = useState<any[]>([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, demandsRes, candidatesRes] = await Promise.all([
        fetch("/api/stats").then(r => r.json()),
        fetch("/api/demands").then(r => r.json()),
        fetch("/api/candidates").then(r => r.json()),
      ]);
      setStats(statsRes);
      setDemands(demandsRes);
      setDemandsState(demandsRes);
      setCandidates(candidatesRes);
    } catch (err) {
      console.error("TDAF Command Center failed to fetch database records", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Immediate Joiners / Bench calculations
  const benchCandidates = useMemo(() => {
    return candidates.filter((c: any) => !c.vendorId && c.status === "AVAILABLE");
  }, [candidates]);

  const activeVendorsList = useMemo(() => {
    return stats?.allVendors || [];
  }, [stats]);

  // SLA Aging positions
  const criticalSlaPositions = useMemo(() => {
    return demandsState.filter((d: any) => d.priority === "HIGH" && d.status === "OPEN");
  }, [demandsState]);

  // Handlers
  const handleToggleOnboarding = (candidateId: string, checkKey: string) => {
    setOnboardingChecks(prev => {
      const current = prev[candidateId] || { contractSigned: false, bgCheck: false, hardwareShipped: false, welcomeCall: false };
      return {
        ...prev,
        [candidateId]: {
          ...current,
          [checkKey]: !current[checkKey]
        }
      };
    });
    triggerNotification("Onboarding checklist status updated!");
  };

  const handleUpdateDemandStatus = (demandId: string, newStatus: string) => {
    setDemandsState(prev => prev.map(d => d.id === demandId ? { ...d, status: newStatus } : d));
    triggerNotification(`Demand status updated to ${newStatus}`);
    
    // Attempt persist to DB optimistically
    fetch("/api/demands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: demandId, status: newStatus }),
    }).catch(err => console.error("Could not sync status change with server", err));
  };

  const handleAssignRecruiter = (demandId: string, recruiter: string) => {
    setSelectedRecruiter(prev => ({ ...prev, [demandId]: recruiter }));
    triggerNotification(`Assigned recruiter ${recruiter} to demand`);
  };

  const generateAIEmail = (demand: any, candidate: any) => {
    if (!demand || !candidate) return;
    setSelectedDemandForAI(demand);
    setSelectedBenchForAI(candidate);
    
    const emailStr = `Subject: Matching Project Opportunity: ${demand.title} at ${demand.client?.name || "Client Account"}

Dear ${candidate.name},

I hope this email finds you well. 

I am writing from the TDAF team to discuss an outstanding new project requirement that matches your skill inventory perfectly. We currently have an open demand for a ${demand.title} with ${demand.client?.name || "our client partner"}.

Key Highlights of this Requisition:
- Role: ${demand.title}
- Skills Required: ${safeParseSkills(demand.requiredSkills).join(", ")}
- Client Sponsor: ${demand.client?.name || "Enterprise Sponsor"}
- Target Start: Immediate Joining

Based on your bench profile indicating deep experience with ${safeParseSkills(candidate.extractedSkills).slice(0, 3).join(", ")}, our AI matcher scored you as a 94% fit for this placement. 

Please reply back to confirm your availability to hop on a client briefing session today.

Best regards,
TDAF Recruitment Coordination Lead
TalentFlow AI Core`;

    setGeneratedEmail(emailStr);
    triggerNotification("AI outreach template compiled successfully!");
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setIsCopied(true);
    triggerNotification("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading || !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <div className="premium-spinner" />
        <style>{`
          .premium-spinner {
            width: 44px;
            height: 44px;
            border: 3px solid var(--color-border-tertiary);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // TDAF Metrics Calculations
  const openDemandsCount = demandsState.filter((d: any) => d.status === "OPEN").length;
  const closedDemandsCount = demandsState.filter((d: any) => d.status === "FILLED" || d.status === "CLOSED").length;
  const fulfillmentPercentage = Math.round((stats.totalHires / (stats.totalDemands || 1)) * 100);

  // Mock schedule data for panels
  const interviewsToday = [
    { id: "1", candidate: "Rajesh Kumar", role: "AI Software Architect", client: "Google", time: "11:00 AM", panel: "Deepak S. (Delivery Lead)", status: "COMPLETED", meeting: "meet.google.com/abc-defg-hij" },
    { id: "2", candidate: "Nisha Patel", role: "Sr. Java Developer", client: "Microsoft", time: "02:30 PM", panel: "Amit R. (Technical Architect)", status: "SCHEDULED", meeting: "zoom.us/j/9876543210" },
    { id: "3", candidate: "Arjun Mehta", role: "DevOps Engineer", client: "Stripe", time: "04:00 PM", panel: "Sanjay M. (Cloud Practice Head)", status: "SCHEDULED", meeting: "meet.google.com/xyz-uvwx-yza" }
  ];

  // Pipeline funnel list
  const pipelineFunnel = [
    { stage: "Sourced", count: Math.round(stats.totalCandidates * 2.2), pct: 100, color: "var(--color-primary)" },
    { stage: "Screened", count: Math.round(stats.totalCandidates * 1.5), pct: 68, color: "var(--color-blue-mid)" },
    { stage: "Submitted", count: Math.round(stats.totalCandidates * 1.1), pct: 50, color: "var(--color-purple)" },
    { stage: "Interviewed", count: Math.round(stats.totalCandidates * 0.7), pct: 32, color: "var(--color-warning)" },
    { stage: "Selected", count: Math.round(stats.totalHires * 1.3), pct: 18, color: "var(--color-success)" },
    { stage: "Joined", count: stats.totalHires, pct: 12, color: "#10B981" }
  ];

  return (
    <div className="tdaf-container">
      {/* Toast Notification */}
      {showNotification && (
        <div className="tdaf-toast pulse-glow">
          <IconSparkles size={16} style={{ color: "var(--color-warning)" }} />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Hero Title Area */}
      <div className="premium-hero-header" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.03em" }}>
              <span className="gradient-text">TDAF Command Center</span>
            </h1>
            <p className="page-sub" style={{ margin: "6px 0 0 0", fontSize: "13px", opacity: 0.85, fontWeight: 500 }}>
              Talent Demand Acquisition & Fulfillment Dashboard • Subcontractor SLAs • Internal Bench Matches • Revenue Impact
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "8px 14px", borderRadius: "30px", fontSize: "11px", fontWeight: 700, background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "var(--color-primary)" }}>
              SLA Delivery System: Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebar Navigation + Right Module Layout */}
      <div className="tdaf-layout-grid">
        
        {/* Navigation Sidebar */}
        <div className="tdaf-nav-sidebar glass-card-premium">
          <div className="nav-group-label">Core Command</div>
          
          <button className={`nav-btn ${activeSubTab === "overview" ? "active" : ""}`} onClick={() => setActiveSubTab("overview")}>
            <IconGauge size={16} /> <span>Overview Portal</span>
          </button>
          
          <button className={`nav-btn ${activeSubTab === "demands" ? "active" : ""}`} onClick={() => setActiveSubTab("demands")}>
            <IconBriefcase size={16} /> <span>Open Demands ({openDemandsCount})</span>
          </button>
          
          <button className={`nav-btn ${activeSubTab === "pipeline" ? "active" : ""}`} onClick={() => setActiveSubTab("pipeline")}>
            <IconDeviceAnalytics size={16} /> <span>Recruitment Pipeline</span>
          </button>

          <div className="nav-group-label">Supply & Partners</div>
          
          <button className={`nav-btn ${activeSubTab === "bench" ? "active" : ""}`} onClick={() => setActiveSubTab("bench")}>
            <IconUsers size={16} /> <span>Internal Bench ({benchCandidates.length})</span>
          </button>
          
          <button className={`nav-btn ${activeSubTab === "vendors" ? "active" : ""}`} onClick={() => setActiveSubTab("vendors")}>
            <IconBuildingStore size={16} /> <span>Vendor Staffing</span>
          </button>

          <button className={`nav-btn ${activeSubTab === "interviews" ? "active" : ""}`} onClick={() => setActiveSubTab("interviews")}>
            <IconCalendarEvent size={16} /> <span>Interview Panels</span>
          </button>

          <div className="nav-group-label">Delivery Controls</div>
          
          <button className={`nav-btn ${activeSubTab === "offers" ? "active" : ""}`} onClick={() => setActiveSubTab("offers")}>
            <IconChecklist size={16} /> <span>Offers & Onboarding</span>
          </button>
          
          <button className={`nav-btn ${activeSubTab === "sla" ? "active" : ""}`} onClick={() => setActiveSubTab("sla")}>
            <IconClock size={16} /> <span>SLA & Escalations</span>
          </button>
          
          <button className={`nav-btn ${activeSubTab === "insights" ? "active" : ""}`} onClick={() => setActiveSubTab("insights")}>
            <IconSparkles size={16} /> <span>AI Analytics & Forecasting</span>
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="tdaf-content-panel">
          
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeSubTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Executive Summary Widgets Grid (10 Widgets) */}
              <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "16px" }}>
                
                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-primary)" } as React.CSSProperties}>
                  <IconBriefcase className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Open Demands</div>
                  <div className="kpi-val">{openDemandsCount}</div>
                  <div className="kpi-delta up">Active Job Openings</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
                  <IconCheck className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Closed Demands</div>
                  <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{closedDemandsCount}</div>
                  <div className="kpi-delta up">Positions Fulfilled</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-error)" } as React.CSSProperties}>
                  <IconAlertCircle className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Critical SLA Aging</div>
                  <div className="kpi-val" style={{ color: "var(--color-error-dark)" }}>{criticalSlaPositions.length}</div>
                  <div className="kpi-delta down">Aging Over SLA Limit</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-purple)" } as React.CSSProperties}>
                  <IconScale className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Fulfillment %</div>
                  <div className="kpi-val" style={{ color: "var(--color-purple-dark)" }}>{fulfillmentPercentage}%</div>
                  <div className="kpi-delta up">Placement Success</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
                  <IconUsers className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Bench Availability</div>
                  <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{benchCandidates.length}</div>
                  <div className="kpi-delta up">{stats.availableNow} total available consultants</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-blue-mid)" } as React.CSSProperties}>
                  <IconBuildingStore className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Active Vendors</div>
                  <div className="kpi-val">{stats.totalVendors}</div>
                  <div className="kpi-delta up">Partner Agencies</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-warning)" } as React.CSSProperties}>
                  <IconCalendarEvent className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Interviews Today</div>
                  <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>{interviewsToday.length}</div>
                  <div className="kpi-delta up">Scheduled Panels</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-teal)" } as React.CSSProperties}>
                  <IconUserCheck className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Offers Released</div>
                  <div className="kpi-val" style={{ color: "#1D9E75" }}>12</div>
                  <div className="kpi-delta up">In Pre-Onboarding</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-primary)" } as React.CSSProperties}>
                  <IconChevronRight className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Joinings (This Week)</div>
                  <div className="kpi-val">4</div>
                  <div className="kpi-delta up">Fulfillment Deployments</div>
                </div>

                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-warning)" } as React.CSSProperties}>
                  <IconCoins className="premium-kpi-icon" size={32} />
                  <div className="kpi-label">Vacancy Revenue Loss</div>
                  <div className="kpi-val" style={{ color: "var(--color-warning-dark)" }}>${(stats.revenueAtRisk / 1000).toFixed(0)}K</div>
                  <div className="kpi-delta down">Annualized Risk</div>
                </div>
              </div>

              {/* Charts Portal */}
              <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                
                {/* Chart A: Demand vs Fulfillment Trend */}
                <div className="card-wireframe glass-card-premium">
                  <div className="card-title-wireframe"><IconTrendingUp size={16} /> Demand vs Placement Monthly Trend</div>
                  <div style={{ height: "230px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: "Jan", Demands: 24, Placements: 18 },
                        { month: "Feb", Demands: 38, Placements: 26 },
                        { month: "Mar", Demands: 52, Placements: 35 },
                        { month: "Apr", Demands: 45, Placements: 40 },
                        { month: "May", Demands: 68, Placements: 51 }
                      ]}>
                        <defs>
                          <linearGradient id="colorD" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" fontSize={11} stroke="var(--color-text-tertiary)" />
                        <YAxis fontSize={11} stroke="var(--color-text-tertiary)" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Demands" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorD)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Placements" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorP)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart B: Skill-wise Demand (Real Data) */}
                <div className="card-wireframe glass-card-premium">
                  <div className="card-title-wireframe"><IconScale size={16} /> Skill-wise Demand Requisition</div>
                  <div style={{ height: "230px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.skillDistribution.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="skill" fontSize={11} stroke="var(--color-text-tertiary)" />
                        <YAxis fontSize={11} stroke="var(--color-text-tertiary)" />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                          {stats.skillDistribution.slice(0, 6).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={["var(--color-primary)", "var(--color-blue-mid)", "var(--color-purple)", "var(--color-warning)", "#D85A30", "#10B981"][index % 6]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart C: Vendor Performance */}
                <div className="card-wireframe glass-card-premium">
                  <div className="card-title-wireframe"><IconBuildingStore size={16} /> Staffing Vendor Performance Metric</div>
                  <div style={{ height: "230px", marginTop: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeVendorsList.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis type="number" fontSize={11} stroke="var(--color-text-tertiary)" />
                        <YAxis dataKey="name" type="category" fontSize={10} stroke="var(--color-text-tertiary)" width={100} />
                        <Tooltip />
                        <Bar dataKey="performanceScore" fill="var(--color-purple)" name="Score" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart D: Resource Allocation Bench Utilization */}
                <div className="card-wireframe glass-card-premium">
                  <div className="card-title-wireframe"><IconUsers size={16} /> Corporate Resource Headcount Mix</div>
                  <div style={{ height: "230px", marginTop: "16px", display: "flex", justifyContent: "center" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Active Placements", value: stats.totalHires },
                            { name: "Internal Bench Available", value: benchCandidates.length },
                            { name: "Subcontracted Resources", value: stats.totalCandidates - benchCandidates.length }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="var(--color-primary)" />
                          <Cell fill="var(--color-success)" />
                          <Cell fill="var(--color-purple)" />
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DEMAND MANAGEMENT */}
          {activeSubTab === "demands" && (
            <div className="card-wireframe glass-card-premium">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div className="card-title-wireframe"><IconBriefcase size={18} style={{ color: "var(--color-primary)" }} /> Active Requisitions Inventory</div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  
                  {/* Search Bar */}
                  <div style={{ display: "flex", alignItems: "center", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", padding: "4px 8px", width: "220px" }}>
                    <IconSearch size={14} style={{ color: "var(--color-text-tertiary)", marginRight: "6px" }} />
                    <input 
                      type="text" 
                      placeholder="Search skill/client/role..." 
                      value={demandSearch} 
                      onChange={e => setDemandSearch(e.target.value)}
                      style={{ background: "none", border: "none", fontSize: "11px", color: "var(--color-text-primary)", outline: "none", width: "100%" }}
                    />
                  </div>

                  {/* Priority Select */}
                  <select 
                    value={demandPriority} 
                    onChange={e => setDemandPriority(e.target.value)}
                    style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", fontSize: "11px", color: "var(--color-text-primary)", padding: "6px 12px", outline: "none" }}
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>

                </div>
              </div>

              {/* Demands Table */}
              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", textAlign: "left" }}>
                      <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Requisition Details</th>
                      <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Client Account</th>
                      <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Budget Range</th>
                      <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Priority</th>
                      <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Fulfillment Flow Status</th>
                      <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Lead / Vendor Assignment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandsState
                      .filter((d: any) => {
                        const matchesStatus = d.status === "OPEN";
                        const matchesSearch = d.title.toLowerCase().includes(demandSearch.toLowerCase()) || 
                                              (d.client?.name || "").toLowerCase().includes(demandSearch.toLowerCase()) ||
                                              d.requiredSkills.toLowerCase().includes(demandSearch.toLowerCase());
                        const matchesPriority = demandPriority === "ALL" ? true : d.priority === demandPriority;
                        return matchesStatus && matchesSearch && matchesPriority;
                      })
                      .map((demand) => {
                        const skills = safeParseSkills(demand.requiredSkills);
                        const assignedRec = selectedRecruiter[demand.id] || "Assigned internally";
                        return (
                          <tr key={demand.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }} className="tdaf-table-row">
                            
                            {/* Role Title and skills */}
                            <td style={{ padding: "14px 10px", maxWidth: "250px" }}>
                              <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "13px" }}>{demand.title}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                                {skills.map(s => (
                                  <span key={s} className="tag tag-blue" style={{ fontSize: "9px", padding: "2px 6px" }}>{s}</span>
                                ))}
                              </div>
                            </td>

                            {/* Client Name */}
                            <td style={{ padding: "14px 10px" }}>
                              <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>{demand.client?.name || "Corporate Account"}</div>
                              <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>ID: DEM-2026-{demand.id.substring(0,4).toUpperCase()}</div>
                            </td>

                            {/* Budget Rate */}
                            <td style={{ padding: "14px 10px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                              ${demand.rateMin} - ${demand.rateMax}/hr
                              <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", fontWeight: 400, marginTop: "2px" }}>Billing Rate Limit</div>
                            </td>

                            {/* Priority Badge */}
                            <td style={{ padding: "14px 10px" }}>
                              <span className="tag" style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: "6px",
                                background: demand.priority === "HIGH" ? "var(--color-red-light)" : demand.priority === "MEDIUM" ? "var(--color-amber-light)" : "var(--color-green-light)",
                                color: demand.priority === "HIGH" ? "var(--color-error-dark)" : demand.priority === "MEDIUM" ? "var(--color-warning-dark)" : "var(--color-success-dark)",
                                fontWeight: 700,
                                fontSize: "10px"
                              }}>
                                <span style={{ 
                                  width: "6px", 
                                  height: "6px", 
                                  borderRadius: "50%", 
                                  background: demand.priority === "HIGH" ? "var(--color-error)" : demand.priority === "MEDIUM" ? "var(--color-warning)" : "var(--color-success)" 
                                }} />
                                {demand.priority}
                              </span>
                            </td>

                            {/* Status and dropdown selector */}
                            <td style={{ padding: "14px 10px" }}>
                              <select 
                                value={demand.status} 
                                onChange={e => handleUpdateDemandStatus(demand.id, e.target.value)}
                                style={{ 
                                  background: demand.status === "OPEN" ? "var(--color-blue-light)" : demand.status === "FILLED" ? "var(--color-green-light)" : "var(--color-background-secondary)",
                                  color: demand.status === "OPEN" ? "var(--color-primary)" : demand.status === "FILLED" ? "var(--color-success-dark)" : "var(--color-text-primary)",
                                  border: "0.5px solid var(--color-border-tertiary)",
                                  borderRadius: "6px",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  outline: "none"
                                }}
                              >
                                <option value="OPEN">Open (Sourcing)</option>
                                <option value="IN_PROGRESS">In Screening</option>
                                <option value="INTERVIEW">Interviews Active</option>
                                <option value="OFFER">Offer Stage</option>
                                <option value="FILLED">Filled (Closed)</option>
                              </select>
                              <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                                SLA Due: {demand.priority === "HIGH" ? "24 Hours" : "3 Days"}
                              </div>
                            </td>

                            {/* Assignment recruiter */}
                            <td style={{ padding: "14px 10px" }}>
                              <select
                                value={assignedRec}
                                onChange={e => handleAssignRecruiter(demand.id, e.target.value)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  borderBottom: "1px dashed var(--color-border-tertiary)",
                                  fontSize: "11px",
                                  color: "var(--color-text-secondary)",
                                  outline: "none",
                                  paddingBottom: "2px"
                                }}
                              >
                                <option value="Assigned internally">Internal Delivery</option>
                                <option value="TechRecruit Pro">TechRecruit Pro</option>
                                <option value="Elite Talent Hub">Elite Talent Hub</option>
                                <option value="TalentBridge">TalentBridge</option>
                              </select>
                            </td>

                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PIPELINE MODULE */}
          {activeSubTab === "pipeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Funnel visualization */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe"><IconDeviceAnalytics size={18} style={{ color: "var(--color-purple)" }} /> Sourcing & Candidate Conversion Pipeline Funnel</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                  {pipelineFunnel.map((item) => (
                    <div key={item.stage} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "100px", fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>{item.stage}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: "16px", background: "var(--color-background-secondary)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                          <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: "8px", transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                      <div style={{ width: "160px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                        {item.count} Candidates ({item.pct}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Statistics */}
              <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-primary)" } as React.CSSProperties}>
                  <div className="kpi-label">Submission Quality Rate</div>
                  <div className="kpi-val">82%</div>
                  <div className="kpi-delta up">Resumes approved by managers</div>
                </div>
                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
                  <div className="kpi-label">Interview Conversion %</div>
                  <div className="kpi-val">44%</div>
                  <div className="kpi-delta up">Technical screen pass rate</div>
                </div>
                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-purple)" } as React.CSSProperties}>
                  <div className="kpi-label">Offer Acceptance Ratio</div>
                  <div className="kpi-val">90%</div>
                  <div className="kpi-delta up">Industry lead benchmark</div>
                </div>
                <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-error)" } as React.CSSProperties}>
                  <div className="kpi-label">Dropout / Resignation</div>
                  <div className="kpi-val" style={{ color: "var(--color-error-dark)" }}>7%</div>
                  <div className="kpi-delta down">Low candidate no-show risk</div>
                </div>
              </div>

              {/* Resume Parsing List Mock */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe"><IconSparkles size={16} style={{ color: "var(--color-warning-dark)" }} /> Real-time Resume Scanning & Score Rankings</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {[
                    { name: "Elena Rostova", skills: "Python, PyTorch, Large Language Models", score: 98, rec: "Immediate Placement" },
                    { name: "Vikram Malhotra", skills: "React, Next.js, Tailwind CSS", score: 91, rec: "Sourcing for Google" },
                    { name: "Sarah Jenkins", skills: "AWS, Kubernetes, Terraform", score: 87, rec: "Needs CI/CD training" }
                  ].map((cand: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px" }} className="premium-interactive-row">
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>{cand.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>Extracted Skills: {cand.skills}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="tag" style={{ background: "var(--color-green-light)", color: "var(--color-success-dark)", fontSize: "10px", fontWeight: 700 }}>
                          AI Score: {cand.score}%
                        </span>
                        <span className="tag" style={{ background: "var(--color-blue-light)", color: "var(--color-primary)", fontSize: "9px" }}>
                          {cand.rec}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: BENCH MANAGEMENT */}
          {activeSubTab === "bench" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Direct Bench Inventory */}
              <div className="card-wireframe glass-card-premium">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "16px" }}>
                  <div className="card-title-wireframe"><IconUsers size={18} style={{ color: "var(--color-success)" }} /> Internal Direct Bench Consultants ({benchCandidates.length})</div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", padding: "4px 8px", width: "200px" }}>
                      <IconSearch size={14} style={{ color: "var(--color-text-tertiary)", marginRight: "6px" }} />
                      <input 
                        type="text" 
                        placeholder="Search consultant..." 
                        value={benchSearch} 
                        onChange={e => setBenchSearch(e.target.value)}
                        style={{ background: "none", border: "none", fontSize: "11px", color: "var(--color-text-primary)", outline: "none", width: "100%" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: "auto", marginTop: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", textAlign: "left" }}>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Consultant Name</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Primary Skillset</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Experience</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Availability Pool</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Upskilling & Recommendation</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Match Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchCandidates
                        .filter((c: any) => c.name.toLowerCase().includes(benchSearch.toLowerCase()))
                        .map((candidate: any, idx: number) => {
                          const skills = safeParseSkills(candidate.extractedSkills);
                          // Determine simulated availability pool
                          const pool = idx % 4 === 0 ? "Immediate Joiner" : idx % 4 === 1 ? "15-Day Availability" : idx % 4 === 2 ? "30-Day Availability" : "Cross-skilled resource";
                          const poolBadge = pool === "Immediate Joiner" ? "var(--color-green-light)" : "var(--color-blue-light)";
                          const poolColor = pool === "Immediate Joiner" ? "var(--color-success-dark)" : "var(--color-primary)";

                          // Determine simulated upskilling recommendation
                          const upskillingRec = skills.includes("React") 
                            ? "Recommend GenAI / LLM module upskilling" 
                            : skills.includes("Python") 
                              ? "Certify in AWS Platform Architectures" 
                              : "Cross-train in Fullstack JavaScript frameworks";

                          return (
                            <tr key={candidate.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }} className="tdaf-table-row">
                              <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--color-text-primary)" }}>{candidate.name}</td>
                              <td style={{ padding: "12px 8px" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                  {skills.slice(0, 3).map(s => (
                                    <span key={s} className="tag tag-blue" style={{ fontSize: "9px" }}>{s}</span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: "12px 8px", fontWeight: 600 }}>{candidate.experienceYears} Years</td>
                              <td style={{ padding: "12px 8px" }}>
                                <span className="tag" style={{ background: poolBadge, color: poolColor, fontSize: "10px", fontWeight: 700 }}>
                                  {pool}
                                </span>
                              </td>
                              <td style={{ padding: "12px 8px", color: "var(--color-text-secondary)", fontSize: "11px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <IconBook size={12} style={{ color: "var(--color-primary)" }} />
                                  <span>{upskillingRec}</span>
                                </div>
                              </td>
                              <td style={{ padding: "12px 8px" }}>
                                <button 
                                  className="action-btn-match"
                                  onClick={() => {
                                    // Match with first open demand
                                    const matchedDemand = demandsState.find(d => d.status === "OPEN") || demandsState[0];
                                    generateAIEmail(matchedDemand, candidate);
                                    setActiveSubTab("insights");
                                  }}
                                  style={{
                                    background: "var(--color-primary)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                  }}
                                >
                                  <IconSparkles size={10} /> Instantly Match
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: VENDOR COORDINATION */}
          {activeSubTab === "vendors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Vendors List and performance tracking */}
              <div className="card-wireframe glass-card-premium">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "16px" }}>
                  <div className="card-title-wireframe"><IconBuildingStore size={18} style={{ color: "var(--color-primary)" }} /> Staffing Partner & Subcontractor Scorecards</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", padding: "4px 8px" }}>
                      <IconSearch size={14} style={{ color: "var(--color-text-tertiary)", marginRight: "6px" }} />
                      <input 
                        type="text" 
                        placeholder="Search vendor..." 
                        value={vendorSearch} 
                        onChange={e => setVendorSearch(e.target.value)}
                        style={{ background: "none", border: "none", fontSize: "11px", color: "var(--color-text-primary)", outline: "none" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: "auto", marginTop: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", textAlign: "left" }}>
                        <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Staffing Agency</th>
                        <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Performance Rating</th>
                        <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Submissions</th>
                        <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Closure Success %</th>
                        <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Avg Turnaround (TAT)</th>
                        <th style={{ padding: "12px 10px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Contract Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVendorsList
                        .filter((v: any) => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                        .map((vendor: any) => {
                          const starsCount = Math.min(5, Math.ceil(vendor.performanceScore / 20));
                          return (
                            <tr key={vendor.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }} className="tdaf-table-row">
                              <td style={{ padding: "14px 10px" }}>
                                <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{vendor.name}</div>
                                <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{vendor.email || "No contact verified"}</div>
                              </td>
                              <td style={{ padding: "14px 10px" }}>
                                <span style={{ color: "var(--color-warning-dark)", fontWeight: 600, display: "flex", gap: "2px" }}>
                                  {"★".repeat(starsCount) + "☆".repeat(5 - starsCount)}
                                </span>
                              </td>
                              <td style={{ padding: "14px 10px", fontWeight: 600 }}>{vendor.demandsCount * 2 + 5} Resumes Sourced</td>
                              <td style={{ padding: "14px 10px", fontWeight: 700, color: "var(--color-success-dark)" }}>
                                {Math.round(vendor.submitToHireRate * 1.5 || 42)}%
                              </td>
                              <td style={{ padding: "14px 10px" }}>
                                <span className="tag" style={{ background: "var(--color-blue-light)", color: "var(--color-primary)", fontWeight: 600 }}>
                                  {vendor.avgFillDays || 6} Days Average
                                </span>
                              </td>
                              <td style={{ padding: "14px 10px", fontWeight: 600 }}>
                                {Math.round(vendor.commissionRate * 100)}% Billing Cut
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: INTERVIEW COORDINATION */}
          {activeSubTab === "interviews" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Interviews Panel Calendar List */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "12px" }}>
                  <IconCalendarEvent size={18} style={{ color: "var(--color-purple)" }} /> Active Interview Schedule & Panels today
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  {interviewsToday.map((int, i) => (
                    <div key={int.id} className="cand-row premium-interactive-row" style={{ padding: "12px 16px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ padding: "8px 12px", background: i === 0 ? "var(--color-green-light)" : "var(--color-blue-light)", color: i === 0 ? "var(--color-success-dark)" : "var(--color-primary)", borderRadius: "8px", fontWeight: 800, fontSize: "11px", minWidth: "75px", textAlign: "center" }}>
                          {int.time}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)" }}>{int.candidate}</div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "3px" }}>
                            Requisition: <strong style={{ color: "var(--color-text-secondary)" }}>{int.role}</strong> for Client: <strong>{int.client}</strong>
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--color-primary)", marginTop: "4px" }}>
                            Video Link: <a href={`https://${int.meeting}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", fontWeight: 600 }}>{int.meeting}</a>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Assigned Technical Panel:</div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{int.panel}</div>
                        </div>
                        <span className="tag" style={{ 
                          background: int.status === "COMPLETED" ? "var(--color-green-light)" : "var(--color-amber-light)", 
                          color: int.status === "COMPLETED" ? "var(--color-success-dark)" : "var(--color-warning-dark)",
                          fontWeight: 700,
                          fontSize: "10px" 
                        }}>
                          {int.status}
                        </span>
                        
                        <button 
                          onClick={() => triggerNotification(`Slack calendar reminder pinged to panel member ${int.panel}`)}
                          style={{
                            background: "none",
                            border: "1px solid var(--color-border-tertiary)",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            cursor: "pointer"
                          }}
                        >
                          Send Ping
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: OFFERS & ONBOARDING */}
          {activeSubTab === "offers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Offers Onboarding Tracker */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "12px" }}>
                  <IconChecklist size={18} style={{ color: "var(--color-success)" }} /> Pre-Onboarding Verification & Joining Milestones
                </div>
                
                <div style={{ overflowX: "auto", marginTop: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", textAlign: "left" }}>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Candidate Name</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Placed Client Project</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600, textAlign: "center" }}>Contract Signed</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600, textAlign: "center" }}>Background Check</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600, textAlign: "center" }}>Hardware Shipped</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600, textAlign: "center" }}>Welcome Call</th>
                        <th style={{ padding: "10px 8px", color: "var(--color-text-secondary)", fontWeight: 600 }}>Target Start Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "1", name: "Ananya Sen", client: "Google Generative AI Project", start: "2026-06-01" },
                        { id: "2", name: "John Davidson", client: "Microsoft Azure Migration Project", start: "2026-06-10" },
                        { id: "3", name: "Michael Chang", client: "Stripe Subscriptions Platform", start: "2026-06-15" }
                      ].map((item: any) => {
                        const checks = onboardingChecks[item.id] || { contractSigned: false, bgCheck: false, hardwareShipped: false, welcomeCall: false };
                        return (
                          <tr key={item.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }} className="tdaf-table-row">
                            <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--color-text-primary)" }}>{item.name}</td>
                            <td style={{ padding: "12px 8px", fontWeight: 600, color: "var(--color-primary)" }}>{item.client}</td>
                            
                            {/* Contract checkbox */}
                            <td style={{ padding: "12px 8px", textAlign: "center" }}>
                              <button 
                                onClick={() => handleToggleOnboarding(item.id, "contractSigned")}
                                style={{
                                  background: checks.contractSigned ? "var(--color-green-light)" : "var(--color-red-light)",
                                  color: checks.contractSigned ? "var(--color-success-dark)" : "var(--color-error-dark)",
                                  border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "10px", fontWeight: 700
                                }}
                              >
                                {checks.contractSigned ? "✓" : "✗"}
                              </button>
                            </td>

                            {/* Background Check checkbox */}
                            <td style={{ padding: "12px 8px", textAlign: "center" }}>
                              <button 
                                onClick={() => handleToggleOnboarding(item.id, "bgCheck")}
                                style={{
                                  background: checks.bgCheck ? "var(--color-green-light)" : "var(--color-red-light)",
                                  color: checks.bgCheck ? "var(--color-success-dark)" : "var(--color-error-dark)",
                                  border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "10px", fontWeight: 700
                                }}
                              >
                                {checks.bgCheck ? "✓" : "✗"}
                              </button>
                            </td>

                            {/* Hardware shipping checkbox */}
                            <td style={{ padding: "12px 8px", textAlign: "center" }}>
                              <button 
                                onClick={() => handleToggleOnboarding(item.id, "hardwareShipped")}
                                style={{
                                  background: checks.hardwareShipped ? "var(--color-green-light)" : "var(--color-red-light)",
                                  color: checks.hardwareShipped ? "var(--color-success-dark)" : "var(--color-error-dark)",
                                  border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "10px", fontWeight: 700
                                }}
                              >
                                {checks.hardwareShipped ? "✓" : "✗"}
                              </button>
                            </td>

                            {/* Welcome Call checkbox */}
                            <td style={{ padding: "12px 8px", textAlign: "center" }}>
                              <button 
                                onClick={() => handleToggleOnboarding(item.id, "welcomeCall")}
                                style={{
                                  background: checks.welcomeCall ? "var(--color-green-light)" : "var(--color-red-light)",
                                  color: checks.welcomeCall ? "var(--color-success-dark)" : "var(--color-error-dark)",
                                  border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "10px", fontWeight: 700
                                }}
                              >
                                {checks.welcomeCall ? "✓" : "✗"}
                              </button>
                            </td>

                            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{item.start}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: SLA & ESCALATION */}
          {activeSubTab === "sla" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Active SLA Escalation Logs */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe" style={{ color: "var(--color-error-dark)" }}>
                  <IconAlertTriangle size={18} style={{ color: "var(--color-error)" }} /> Active Priority SLA Escalations
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  {[
                    { id: "1", title: "Senior AI Architect open > 5 days with zero submissions", client: "Google", priority: "CRITICAL", aging: "5 Days aging", action: "Ping staffing partners immediately" },
                    { id: "2", title: "Recruiter inactivity warning: React Native position", client: "Amazon", priority: "HIGH", aging: "3 Days inactivity", action: "Reassign to vendorTechRecruit" },
                    { id: "3", title: "Technical interview feedback pending by panel Deepak S.", client: "Stripe", priority: "CRITICAL", aging: "28 Hours delay", action: "Trigger SMS calendar notification" }
                  ].map((esc: any, i: number) => (
                    <div key={esc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", borderLeft: "4px solid var(--color-error)" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="tag" style={{ background: "var(--color-red-light)", color: "var(--color-error-dark)", fontSize: "9px", fontWeight: 700 }}>
                            {esc.priority}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>{esc.title}</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                          Client Partner: <strong>{esc.client}</strong> • Delay duration: <strong>{esc.aging}</strong>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => triggerNotification(`Escalation addressed: ${esc.action}`)}
                          style={{
                            background: "var(--color-background-secondary)",
                            border: "1px solid var(--color-border-tertiary)",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                            cursor: "pointer"
                          }}
                        >
                          Resolve Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 9: AI INSIGHTS & EMAIL GENERATOR */}
          {activeSubTab === "insights" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Generative AI Outreach Email Builder */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <IconSparkles size={18} style={{ color: "var(--color-warning-dark)" }} />
                  <span>Generative AI Bench-to-Demand Allocation Assistant</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
                  
                  {/* Matching selector panels */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* Open demands selector */}
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Select Target Job Requisition:</label>
                      <select 
                        style={{ width: "100%", marginTop: "6px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", fontSize: "12px", padding: "8px", outline: "none", color: "var(--color-text-primary)" }}
                        onChange={e => {
                          const matchedD = demandsState.find(d => d.id === e.target.value);
                          if (matchedD) generateAIEmail(matchedD, selectedBenchForAI || benchCandidates[0]);
                        }}
                        value={selectedDemandForAI?.id || ""}
                      >
                        <option value="" disabled>-- Choose Open Requisition --</option>
                        {demandsState.filter((d: any) => d.status === "OPEN").map((d: any) => (
                          <option key={d.id} value={d.id}>{d.title} ({d.client?.name})</option>
                        ))}
                      </select>
                    </div>

                    {/* Bench consultant selector */}
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Select Recommended Bench Resource:</label>
                      <select
                        style={{ width: "100%", marginTop: "6px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", fontSize: "12px", padding: "8px", outline: "none", color: "var(--color-text-primary)" }}
                        onChange={e => {
                          const matchedB = benchCandidates.find(c => c.id === e.target.value);
                          if (matchedB) generateAIEmail(selectedDemandForAI || demandsState[0], matchedB);
                        }}
                        value={selectedBenchForAI?.id || ""}
                      >
                        <option value="" disabled>-- Choose Bench Resource --</option>
                        {benchCandidates.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name} ({safeParseSkills(c.extractedSkills).slice(0,2).join(", ")})</option>
                        ))}
                      </select>
                    </div>

                    {/* AI Predictor Insights list */}
                    <div style={{ marginTop: "10px", padding: "12px", background: "rgba(59, 130, 246, 0.05)", border: "1px dashed rgba(59, 130, 246, 0.2)", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "var(--color-primary)" }}>
                        <IconSparkles size={12} />
                        <span>AI Allocation Prediction Details:</span>
                      </div>
                      <p style={{ fontSize: "10px", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                        The recommended consultant shares a 94% skills overlap rating and matches the client timezone preference exactly. Expected time-to-client-onboarding: <strong>4.2 Days</strong>.
                      </p>
                    </div>

                  </div>

                  {/* Email Output Editor */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>AI outreach notification template:</label>
                      {generatedEmail && (
                        <button 
                          onClick={handleCopyEmail}
                          style={{
                            background: isCopied ? "var(--color-green-light)" : "var(--color-primary)",
                            color: isCopied ? "var(--color-success-dark)" : "#fff",
                            border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "10px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                          }}
                        >
                          {isCopied ? "Copied ✓" : "Copy Outreach"}
                        </button>
                      )}
                    </div>
                    
                    <textarea 
                      readOnly
                      placeholder="Select an open project requisition and bench consultant to build your personalized AI matching template..."
                      value={generatedEmail}
                      style={{ 
                        width: "100%", 
                        height: "200px", 
                        background: "var(--color-background-secondary)", 
                        border: "0.5px solid var(--color-border-tertiary)", 
                        borderRadius: "8px", 
                        padding: "10px", 
                        fontSize: "11px", 
                        fontFamily: "monospace", 
                        color: "var(--color-text-primary)", 
                        outline: "none", 
                        resize: "none" 
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* Skill gap analysis prediction */}
              <div className="card-wireframe glass-card-premium">
                <div className="card-title-wireframe"><IconScale size={16} style={{ color: "var(--color-primary)" }} /> Predictive Talent Requirements and Skill Forecasting</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", marginTop: "16px" }}>
                  <div>
                    <h4 style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 10px 0" }}>Projected Talent Shortfall:</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { skill: "Large Language Models / NLP", demand: 18, supply: 4, gap: "Critical Shortage" },
                        { skill: "AWS Solutions Architecture", demand: 12, supply: 8, gap: "Moderate Shortage" },
                        { skill: "Golang Microservices", demand: 9, supply: 7, gap: "Sufficient Available" }
                      ].map((item: any, i: number) => (
                        <div key={i} style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 700 }}>{item.skill}</div>
                            <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>Demand: {item.demand} posts • Bench: {item.supply} available</div>
                          </div>
                          <span className="tag" style={{ background: item.gap === "Critical Shortage" ? "var(--color-red-light)" : "var(--color-blue-light)", color: item.gap === "Critical Shortage" ? "var(--color-error-dark)" : "var(--color-primary)", fontSize: "9px", fontWeight: 700 }}>
                            {item.gap}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 10px 0" }}>Annualized Demand Trend Forecast:</h4>
                    <div style={{ height: "140px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { name: "Q1", Forecast: 15 },
                          { name: "Q2", Forecast: 28 },
                          { name: "Q3", Forecast: 45 },
                          { name: "Q4", Forecast: 62 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" fontSize={10} stroke="var(--color-text-tertiary)" />
                          <YAxis fontSize={10} stroke="var(--color-text-tertiary)" />
                          <Tooltip />
                          <Line type="monotone" dataKey="Forecast" stroke="var(--color-warning-dark)" strokeWidth={2} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Embedded CSS styles block for Spacious layouts & Premium Aesthetics */}
      <style>{`
        .tdaf-container {
          padding: 20px 24px;
        }

        .tdaf-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: var(--color-background-primary);
          border: 1px solid var(--color-border-tertiary);
          border-left: 4px solid var(--color-warning-dark);
          border-radius: 8px;
          padding: 12px 18px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-primary);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(100%) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .tdaf-layout-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          align-items: start;
        }

        .tdaf-nav-sidebar {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 14px;
          border: 1px solid var(--color-border-tertiary);
          border-radius: 12px;
        }

        .nav-group-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--color-text-tertiary);
          letter-spacing: 0.1em;
          padding: 12px 10px 4px 10px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--color-text-secondary);
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .nav-btn:hover {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }

        .nav-btn.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-primary);
          font-weight: 700;
        }

        .tdaf-content-panel {
          min-width: 0; /* Prevents flex children from overflowing chart */
        }

        .premium-interactive-row {
          transition: all 0.2s ease;
        }

        .premium-interactive-row:hover {
          background: rgba(59, 130, 246, 0.03);
          transform: translateX(2px);
        }

        .tdaf-table-row {
          transition: background-color 0.15s ease;
        }

        .tdaf-table-row:hover {
          background: rgba(59, 130, 246, 0.04) !important;
        }

        .action-btn-match:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        
        .action-btn-match:active {
          transform: translateY(0);
        }
      `}</style>

    </div>
  );
}
