"use client";

import { useEffect, useState } from "react";
import { 
  IconMapPin, 
  IconSearch, 
  IconChevronRight, 
  IconCheck, 
  IconX, 
  IconAlertTriangle, 
  IconAward, 
  IconBuilding, 
  IconPlaneDeparture, 
  IconInfoCircle,
  IconRoute
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationInfo {
  city: string;
  state: string;
  isRemote: boolean;
  full: string;
}

function parseLocation(locStr: string | null | undefined): LocationInfo {
  if (!locStr) return { city: "Unspecified", state: "Unspecified", isRemote: false, full: "Remote / Unspecified" };
  const trimStr = locStr.trim();
  if (trimStr.toLowerCase() === "remote") {
    return { city: "Remote", state: "Global", isRemote: true, full: "Remote" };
  }
  const parts = trimStr.split(",");
  const city = parts[0]?.trim() || trimStr;
  const state = parts[1]?.trim() || "Local";
  return { city, state, isRemote: false, full: trimStr };
}

export default function LocationMatchTab() {
  const [demands, setDemands] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/demands").then(r => r.json()),
      fetch("/api/candidates").then(r => r.json()),
    ]).then(([d, c]) => {
      setDemands(d);
      setCandidates(c);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const demand = demands.find(d => d.id === selectedDemand);
  const candidate = candidates.find(c => c.id === selectedCandidate);

  const demandLoc = parseLocation(demand?.location);
  const candidateLoc = parseLocation(candidate?.location);

  // Match logic
  let matchScore = 0;
  let matchCategory = "";
  let matchReason = "";
  let relocationEstimate = "$0";
  let feasibilityColor = "var(--color-text-tertiary)";
  let feasibilityBg = "var(--color-background-secondary)";

  if (demand && candidate) {
    if (demandLoc.isRemote) {
      matchScore = 100;
      matchCategory = "PERFECT_MATCH";
      matchReason = "Remote job profile. The candidate can work from any location globally without any relocation overhead.";
      feasibilityColor = "var(--color-success-dark)";
      feasibilityBg = "var(--color-green-light)";
    } else if (candidateLoc.isRemote) {
      matchScore = 50;
      matchCategory = "HYBRID_NEGOTIATION";
      matchReason = "Candidate prefers remote-only arrangements, but the job profile specifies an onsite/hybrid location. Hybrid arrangement or relocation negotiation is recommended.";
      feasibilityColor = "var(--color-warning-dark)";
      feasibilityBg = "var(--color-amber-light)";
    } else if (demandLoc.city.toLowerCase() === candidateLoc.city.toLowerCase() && demandLoc.state.toLowerCase() === candidateLoc.state.toLowerCase()) {
      matchScore = 100;
      matchCategory = "EXACT_MATCH";
      matchReason = `Exact location match! Candidate is already based in ${demandLoc.full}. No travel or relocation required.`;
      feasibilityColor = "var(--color-success-dark)";
      feasibilityBg = "var(--color-green-light)";
    } else if (demandLoc.state.toLowerCase() === candidateLoc.state.toLowerCase()) {
      matchScore = 75;
      matchCategory = "STATE_MATCH";
      matchReason = `Same state match (${demandLoc.state}). Candidate lives in ${candidateLoc.city} and job is in ${demandLoc.city}. Feasible for hybrid commute, occasional travel, or light relocation.`;
      relocationEstimate = "$1,500";
      feasibilityColor = "var(--color-primary)";
      feasibilityBg = "var(--color-blue-light)";
    } else {
      matchScore = 20;
      matchCategory = "RELOCATION_REQUIRED";
      matchReason = `Geographical mismatch. Candidate is based in ${candidateLoc.full} while the job is in ${demandLoc.full}. Candidate will need full relocation to fulfill this role.`;
      relocationEstimate = "$4,500 - $6,000";
      feasibilityColor = "var(--color-error-dark)";
      feasibilityBg = "var(--color-red-light)";
    }
  }

  if (loading) return (
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

  return (
    <div className="location-match-container">
      <div className="page-title">Location Match Analysis</div>
      <div className="page-sub">
        Evaluate candidate geographical proximity, hybrid feasibility, and relocation requirements against the job profile
      </div>

      {/* Selectors */}
      <div className="two-col" style={{ marginBottom: "24px" }}>
        <div className="card-wireframe">
          <div className="card-title-wireframe" style={{ marginBottom: "12px" }}>
            <IconSearch size={15} /> Select Job (Demand)
          </div>
          <Select 
            value={selectedDemand} 
            onValueChange={setSelectedDemand}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a job demand...">
                {selectedDemand ? (demand?.title ?? "Choose a job demand...") : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {demands.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title} ({d.location || "Remote"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {demand && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <IconMapPin size={14} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                Job Location: <span className="tag tag-purple" style={{ marginLeft: "4px" }}>{demand.location || "Remote"}</span>
              </span>
            </div>
          )}
        </div>
 
        <div className="card-wireframe">
          <div className="card-title-wireframe" style={{ marginBottom: "12px" }}>
            <IconSearch size={15} /> Select Candidate
          </div>
          <Select 
            value={selectedCandidate} 
            onValueChange={setSelectedCandidate}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a candidate...">
                {selectedCandidate ? (candidate?.name ?? "Choose a candidate...") : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {candidates.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.location || "Unspecified"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {candidate && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <IconMapPin size={14} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                Candidate Location: <span className="tag tag-blue" style={{ marginLeft: "4px" }}>{candidate.location || "Remote / Unspecified"}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {demand && candidate ? (
        <div className="analysis-results">
          
          {/* Main Visual Row: Match Score & Map Visualizer */}
          <div className="two-col" style={{ marginBottom: "20px" }}>
            
            {/* Score Ring */}
            <div className="card-wireframe" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <div className="card-title-wireframe" style={{ justifyContent: "center", marginBottom: "16px" }}>
                <IconAward size={18} style={{ color: feasibilityColor }} />
                Geographic Alignment Score
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ position: "relative", width: "120px", height: "120px" }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-background-secondary)" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke={feasibilityColor}
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 50 * matchScore / 100} ${2 * Math.PI * 50 * (100 - matchScore) / 100}`}
                      strokeLinecap="round"
                      transform="rotate(-90, 60, 60)"
                      style={{ transition: "stroke-dasharray 0.8s ease" }}
                    />
                    <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="800" fill="var(--color-text-primary)">
                      {matchScore}%
                    </text>
                  </svg>
                </div>
                <div style={{ maxWidth: "240px" }}>
                  <div style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background: feasibilityBg,
                    color: feasibilityColor,
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "8px"
                  }}>
                    {matchCategory.replace("_", " ")}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>
                    {candidate.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    Location: {candidateLoc.full}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    Target Job: {demand.title} ({demandLoc.full})
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Map Routing Visualizer */}
            <div className="card-wireframe map-visualizer" style={{ minHeight: "200px" }}>
              <div className="card-title-wireframe" style={{ marginBottom: "12px" }}>
                <IconRoute size={16} style={{ color: "var(--color-primary)" }} /> Geographic Route Proximity Visualizer
              </div>
              <div className="map-canvas">
                
                {/* Node 1: Candidate */}
                <div className="map-node candidate-node">
                  <div className="node-pulse" />
                  <div className="node-pin">
                    <IconMapPin size={18} />
                  </div>
                  <div className="node-label">
                    <div className="node-title">Candidate</div>
                    <div className="node-sub">{candidateLoc.full}</div>
                  </div>
                </div>

                {/* Animated Connection Route */}
                <div className="map-route">
                  <svg width="100%" height="100%" style={{ overflow: "visible" }}>
                    <path
                      d="M 60 70 Q 150 20, 240 70"
                      fill="none"
                      stroke={matchScore >= 75 ? "var(--color-success)" : matchScore >= 50 ? "var(--color-warning)" : "var(--color-error)"}
                      strokeWidth="2.5"
                      strokeDasharray={matchCategory === "PERFECT_MATCH" ? "4 4" : "6 4"}
                      className="route-line animate-dash"
                    />
                  </svg>
                  {matchCategory !== "EXACT_MATCH" && matchCategory !== "PERFECT_MATCH" && (
                    <div className="route-airplane animate-fly">
                      <IconPlaneDeparture size={12} style={{ transform: "rotate(45deg)", color: feasibilityColor }} />
                    </div>
                  )}
                </div>

                {/* Node 2: Job Demand */}
                <div className="map-node job-node">
                  <div className="node-pulse" style={{ animationDelay: "1s" }} />
                  <div className="node-pin" style={{ background: "var(--color-primary)", color: "white" }}>
                    <IconBuilding size={16} />
                  </div>
                  <div className="node-label">
                    <div className="node-title">Job Target</div>
                    <div className="node-sub">{demandLoc.full}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="verdict-banner" style={{ background: feasibilityBg, borderLeft: `4px solid ${feasibilityColor}` }}>
            <IconInfoCircle size={18} style={{ color: feasibilityColor, flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12px", color: "var(--color-text-primary)", fontWeight: 500, lineHeight: 1.6 }}>
              <strong style={{ color: feasibilityColor }}>Proximity Review: </strong>
              {matchReason}
            </div>
          </div>

          {/* Detailed Proximity Analytics Cards */}
          <div className="two-col" style={{ marginTop: "16px" }}>
            
            {/* Relocation & Feasibility Details */}
            <div className="card-wireframe">
              <div className="card-title-wireframe">
                <IconPlaneDeparture size={15} style={{ color: "var(--color-primary)" }} /> Relocation & Travel Feasibility
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                
                <div className="analytic-row">
                  <div className="analytic-label">Relocation Required</div>
                  <div className="analytic-val" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {matchCategory === "RELOCATION_REQUIRED" ? (
                      <span className="tag tag-red"><IconX size={10} /> Full Relocation</span>
                    ) : matchCategory === "HYBRID_NEGOTIATION" ? (
                      <span className="tag tag-amber"><IconAlertTriangle size={10} /> Hybrid Negotiation</span>
                    ) : matchCategory === "STATE_MATCH" ? (
                      <span className="tag tag-blue"><IconInfoCircle size={10} /> Moderate Travel</span>
                    ) : (
                      <span className="tag tag-green"><IconCheck size={10} /> Not Required</span>
                    )}
                  </div>
                </div>

                <div className="analytic-row">
                  <div className="analytic-label">Estimated Relocation Cost</div>
                  <div className="analytic-val" style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {relocationEstimate}
                  </div>
                </div>

                <div className="analytic-row">
                  <div className="analytic-label">Travel Proximity Class</div>
                  <div className="analytic-val" style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
                    {matchScore === 100 ? "Local (No travel overhead)" : matchScore === 75 ? "Intra-state (Occasional commute feasible)" : "Cross-region (High overhead)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Location checklist */}
            <div className="card-wireframe">
              <div className="card-title-wireframe">
                <IconCheck size={15} style={{ color: "var(--color-success-dark)" }} /> Proximity Checklist
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                
                <div className="checklist-item">
                  <span className={`check-icon ${demandLoc.isRemote ? "success" : "neutral"}`}>
                    {demandLoc.isRemote ? "✓" : "—"}
                  </span>
                  <div>
                    <div className="check-title">Remote Requisition Accommodation</div>
                    <div className="check-desc">{demandLoc.isRemote ? "This job is designated Remote." : "This job requires physical target office attendance."}</div>
                  </div>
                </div>

                <div className="checklist-item">
                  <span className={`check-icon ${demandLoc.state.toLowerCase() === candidateLoc.state.toLowerCase() ? "success" : "danger"}`}>
                    {demandLoc.state.toLowerCase() === candidateLoc.state.toLowerCase() ? "✓" : "✗"}
                  </span>
                  <div>
                    <div className="check-title">Intra-State Geographical Alignment</div>
                    <div className="check-desc">
                      {demandLoc.state.toLowerCase() === candidateLoc.state.toLowerCase() 
                        ? `Both candidate and job reside in the state of ${demandLoc.state}.` 
                        : `Reside in different states: Candidate (${candidateLoc.state}) vs Job (${demandLoc.state}).`
                      }
                    </div>
                  </div>
                </div>

                <div className="checklist-item">
                  <span className={`check-icon ${matchScore === 100 ? "success" : "danger"}`}>
                    {matchScore === 100 ? "✓" : "✗"}
                  </span>
                  <div>
                    <div className="check-title">Commute Overhead Limit</div>
                    <div className="check-desc">{matchScore === 100 ? "Commute overhead is zero or negligible." : "Commute overhead is significant; travel or relocation is required."}</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="card-wireframe" style={{ textAlign: "center", padding: "48px" }}>
          <IconMapPin size={40} style={{ color: "var(--color-text-tertiary)", marginBottom: "12px" }} />
          <div style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Select a job demand and a candidate above to analyze geographical proximity
          </div>
          <div style={{ color: "var(--color-text-tertiary)", fontSize: "12px", marginTop: "8px" }}>
            The analysis will determine relocation overhead, hybrid feasibility, and state proximity alignment.
          </div>
        </div>
      )}

      {/* Global CSS Styles for Location Tab */}
      <style jsx global>{`
        .location-match-container {
          max-width: 1200px;
        }

        .map-visualizer {
          background: var(--color-background-primary);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .map-canvas {
          margin-top: 10px;
          height: 120px;
          background: radial-gradient(circle at center, var(--color-background-secondary) 1px, transparent 1px);
          background-size: 14px 14px;
          border-radius: var(--radius);
          border: 0.5px solid var(--color-border-tertiary);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
        }

        .map-node {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
        }

        .node-pulse {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-primary);
          opacity: 0.15;
          animation: nodePulse 2.5s infinite ease-out;
        }

        @keyframes nodePulse {
          0% { transform: scale(0.6); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .node-pin {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-purple-light);
          color: var(--color-purple);
          border: 1px solid var(--color-border-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 2;
          transition: all 0.2s;
        }

        .map-node:hover .node-pin {
          transform: scale(1.1);
        }

        .node-label {
          margin-top: 6px;
          text-align: center;
          min-width: 90px;
        }

        .node-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .node-sub {
          font-size: 10px;
          color: var(--color-text-tertiary);
          margin-top: 1px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }

        .map-route {
          position: absolute;
          left: 68px;
          right: 68px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          pointer-events: none;
        }

        .route-line {
          stroke-dasharray: 6 4;
        }

        .animate-dash {
          animation: dashMove 20s linear infinite;
        }

        @keyframes dashMove {
          to { stroke-dashoffset: -100; }
        }

        .route-airplane {
          position: absolute;
          width: 16px;
          height: 16px;
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          offset-path: path('M 0 50 Q 75 0, 150 50'); /* rough offset path for connection */
          animation: flyAcross 6s infinite ease-in-out;
        }

        @keyframes flyAcross {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }

        .verdict-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius);
          margin-bottom: 20px;
        }

        .analytic-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
          font-size: 12px;
        }

        .analytic-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .analytic-label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
        }

        .check-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          flex-shrink: 0;
        }

        .check-icon.success {
          background: var(--color-green-light);
          color: var(--color-success-dark);
        }

        .check-icon.danger {
          background: var(--color-red-light);
          color: var(--color-error-dark);
        }

        .check-icon.neutral {
          background: var(--color-background-secondary);
          color: var(--color-text-secondary);
        }

        .check-title {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .check-desc {
          font-size: 10px;
          color: var(--color-text-tertiary);
          margin-top: 1px;
        }
      `}</style>
    </div>
  );
}
