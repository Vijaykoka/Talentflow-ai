"use client";

import { useEffect, useState, useCallback } from "react";
import { IconScale, IconSearch, IconX, IconCheck, IconAlertTriangle, IconAward } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills;
  try { return JSON.parse(skills); } catch { return []; }
}

export default function SkillGapTab() {
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

  const demandSkills = demand ? parseSkills(demand.requiredSkills) : [];
  const candidateSkills = candidate ? parseSkills(candidate.extractedSkills) : [];

  const matchedSkills = demandSkills.filter(ds =>
    candidateSkills.some(cs => cs.toLowerCase() === ds.toLowerCase())
  );
  const missingSkills = demandSkills.filter(ds =>
    !candidateSkills.some(cs => cs.toLowerCase() === ds.toLowerCase())
  );
  const extraSkills = candidateSkills.filter(cs =>
    !demandSkills.some(ds => ds.toLowerCase() === cs.toLowerCase())
  );

  const matchRate = demandSkills.length > 0
    ? Math.round((matchedSkills.length / demandSkills.length) * 100)
    : 0;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div>
      <div className="page-title">Skill Gap Analysis</div>
      <div className="page-sub">
        Compare candidate skills against demand requirements and identify gaps
      </div>

      {/* Selectors */}
      <div className="two-col" style={{ marginBottom: "20px" }}>
        <div className="card-wireframe">
          <div className="card-title-wireframe" style={{ marginBottom: "10px" }}>
            <IconSearch size={15} /> Select Demand (Job)
          </div>
          <Select value={selectedDemand} onValueChange={setSelectedDemand}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a demand..." />
            </SelectTrigger>
            <SelectContent>
              {demands.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {demand && (
            <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {demandSkills.map(s => (
                <span key={s} className="tag tag-purple" style={{ fontSize: "11px", padding: "3px 8px" }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        <div className="card-wireframe">
          <div className="card-title-wireframe" style={{ marginBottom: "10px" }}>
            <IconSearch size={15} /> Select Candidate
          </div>
          <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a candidate..." />
            </SelectTrigger>
            <SelectContent>
              {candidates.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.experienceYears}y exp)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {candidate && (
            <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {candidateSkills.slice(0, 8).map(s => (
                <span key={s} className="tag tag-blue" style={{ fontSize: "11px", padding: "3px 8px" }}>{s}</span>
              ))}
              {candidateSkills.length > 8 && (
                <span className="tag" style={{ fontSize: "11px", padding: "3px 8px", background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>
                  +{candidateSkills.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {demand && candidate && (
        <div>
          {/* Score Meter */}
          <div className="card-wireframe" style={{ marginBottom: "12px", textAlign: "center", padding: "20px" }}>
            <div className="card-title-wireframe" style={{ justifyContent: "center", marginBottom: "12px" }}>
              <IconAward size={18} style={{ color: matchRate >= 70 ? "var(--color-success-dark)" : matchRate >= 40 ? "var(--color-warning-dark)" : "var(--color-error-dark)" }} />
              Skill Match Score
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <div style={{ position: "relative", width: "100px", height: "100px" }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-background-secondary)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke={matchRate >= 70 ? "var(--color-success-dark)" : matchRate >= 40 ? "var(--color-warning-dark)" : "var(--color-error-dark)"}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 42 * matchRate / 100} ${2 * Math.PI * 42 * (100 - matchRate) / 100}`}
                    strokeLinecap="round"
                    transform="rotate(-90, 50, 50)"
                    style={{ transition: "stroke-dasharray 0.8s ease" }}
                  />
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill="var(--color-text-primary)">
                    {matchRate}%
                  </text>
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                  {candidate.name} vs {demand.title}
                </div>
                <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ color: "var(--color-success-dark)" }}>✓ {matchedSkills.length} of {demandSkills.length} skills matched</span>
                  <span style={{ color: "var(--color-error-dark)" }}>✗ {missingSkills.length} skills missing</span>
                  <span style={{ color: "var(--color-text-tertiary)" }}>⊕ {extraSkills.length} additional skills</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Match Matrix */}
          <div className="two-col">
            <div className="card-wireframe">
              <div className="card-title-wireframe" style={{ color: "var(--color-success-dark)" }}>
                <IconCheck size={15} /> Matched Skills ({matchedSkills.length})
              </div>
              {matchedSkills.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {matchedSkills.map(skill => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "var(--radius)", background: "var(--color-green-light)" }}>
                      <IconCheck size={14} style={{ color: "var(--color-success-dark)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>No matching skills</div>
              )}
            </div>

            <div className="card-wireframe">
              <div className="card-title-wireframe" style={{ color: "var(--color-error-dark)" }}>
                <IconX size={15} /> Missing Skills ({missingSkills.length})
              </div>
              {missingSkills.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {missingSkills.map(skill => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "var(--radius)", background: "var(--color-red-light)" }}>
                      <IconAlertTriangle size={14} style={{ color: "var(--color-error-dark)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                  {demandSkills.length === 0 ? "No skills required" : "All skills covered!"}
                </div>
              )}
            </div>
          </div>

          {/* Candidate's Additional Skills */}
          {extraSkills.length > 0 && (
            <div className="card-wireframe" style={{ marginTop: "12px" }}>
              <div className="card-title-wireframe" style={{ color: "var(--color-text-secondary)" }}>
                <IconAward size={15} /> Candidate&rsquo;s Additional Skills ({extraSkills.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {extraSkills.map(skill => (
                  <span key={skill} className="tag" style={{ fontSize: "11px", padding: "4px 10px", background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!demand && !candidate && (
        <div className="card-wireframe" style={{ textAlign: "center", padding: "48px" }}>
          <IconScale size={40} style={{ color: "var(--color-text-tertiary)", marginBottom: "12px" }} />
          <div style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Select a demand and a candidate above to analyze skill gaps
          </div>
          <div style={{ color: "var(--color-text-tertiary)", fontSize: "12px", marginTop: "8px" }}>
            The analysis will show matched skills, missing skills, and additional qualifications
          </div>
        </div>
      )}
    </div>
  );
}
