"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, Flame, MapPin, DollarSign, Mail, Phone } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "tag tag-green",
  INTERVIEWING: "tag tag-amber",
  OFFERED: "tag tag-blue",
  HIRED: "tag tag-red",
  UNAVAILABLE: "tag tag-gray",
};

const HIRE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "tag tag-green",
  COMPLETED: "tag tag-blue",
  CANCELLED: "tag tag-gray",
};

function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills;
  try { return JSON.parse(skills); } catch { return []; }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

interface Hire {
  id: string;
  hiredRate: number;
  hiringCost: number;
  startDate: string;
  status: string;
  projectedMargin12m: number | null;
  demand: {
    id: string;
    title: string;
    location: string | null;
    rateMin: number;
    rateMax: number;
  };
  vendor: {
    id: string;
    name: string;
  } | null;
}

interface CandidateWithProjects {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  extractedSkills: string;
  experienceYears: number;
  currentCtc: number | null;
  expectedCtc: number | null;
  status: string;
  hotTalent: boolean;
  hires: Hire[];
}

export default function CandidatesWithProjectsPage() {
  const [candidates, setCandidates] = useState<CandidateWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  useEffect(() => { fetchCandidatesWithProjects(); }, []);

  const fetchCandidatesWithProjects = async () => {
    const res = await fetch("/api/candidates-with-projects");
    setCandidates(await res.json());
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalCandidates = candidates.length;
  const candidatesWithHires = candidates.filter(c => c.hires.length > 0).length;
  const totalActiveProjects = candidates.reduce((sum, c) => sum + c.hires.filter(h => h.status === "ACTIVE").length, 0);
  const totalMargin = candidates.reduce((sum, c) => sum + c.hires.reduce((hSum, h) => hSum + (h.projectedMargin12m || 0), 0), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div className="page-title">Candidate Projects</div>
          <div className="page-sub">All candidates with their respective billed projects</div>
        </div>
      </div>

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
          <Users className="h-4 w-4" style={{ color: "var(--color-primary)" }} /> All Candidates with Projects ({candidates.length})
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Candidate</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Contact</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Skills</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Exp</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Projects (Billed In)</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Project Count</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <>
                  <tr key={candidate.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "8px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {candidate.hotTalent && <Flame className="h-3.5 w-3.5" style={{ color: "#EF9F27" }} />}
                        {candidate.name}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-secondary)", fontSize: "11px" }}>
                        <Mail className="h-3 w-3" />{candidate.email}
                      </div>
                      {candidate.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-tertiary)", fontSize: "11px", marginTop: "2px" }}>
                          <Phone className="h-3 w-3" />{candidate.phone}
                        </div>
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
                      <span className={STATUS_COLORS[candidate.status] || "tag"}>{candidate.status}</span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      {candidate.hires.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "300px" }}>
                          {candidate.hires.slice(0, 2).map(hire => (
                            <div key={hire.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", background: "var(--color-background-secondary)", borderRadius: "var(--radius)", fontSize: "11px" }}>
                              <Briefcase className="h-3 w-3" style={{ color: "var(--color-primary)" }} />
                              <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{hire.demand.title}</span>
                              <span style={{ color: "var(--color-text-secondary)" }}>${hire.hiredRate}/hr</span>
                              <span className={HIRE_STATUS_COLORS[hire.status]}>{hire.status}</span>
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
                              +{candidate.hires.length - 2} more projects
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>No projects yet</span>
                      )}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span className={candidate.hires.length > 0 ? "tag tag-green" : "tag"} style={{ background: candidate.hires.length > 0 ? "var(--color-green-light)" : "var(--color-background-secondary)", color: candidate.hires.length > 0 ? "var(--color-success-dark)" : "var(--color-text-tertiary)" }}>
                        {candidate.hires.length}
                      </span>
                    </td>
                  </tr>
                  {expandedCandidate === candidate.id && candidate.hires.length > 2 && (
                    <tr key={`${candidate.id}-expanded`}>
                      <td colSpan={7} style={{ padding: "12px", background: "var(--color-background-secondary)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                          {candidate.hires.slice(2).map(hire => (
                            <div key={hire.id} style={{ padding: "10px", background: "var(--color-background-primary)", borderRadius: "var(--radius)", border: "0.5px solid var(--color-border-tertiary)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <Briefcase className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
                                <span style={{ fontWeight: 500, color: "var(--color-text-primary)", fontSize: "12px" }}>{hire.demand.title}</span>
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
              {candidates.length === 0 && (
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