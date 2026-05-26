"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Users, Plus, Flame, Mail, Phone } from "lucide-react";

function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills;
  try { return JSON.parse(skills); } catch { return []; }
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Array<{
  id: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  currentCtc: number | null;
  expectedCtc: number | null;
  extractedSkills: string;
  status: string;
  hotTalent: boolean;
  createdAt: string;
  updatedAt: string;
  resumes: Array<{ id: string }>;
}>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    experienceYears: "", currentCtc: "", expectedCtc: "", extractedSkills: "",
  });

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    const res = await fetch("/api/candidates");
    setCandidates(await res.json());
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.extractedSkills.split(",").map(s => s.trim()).filter(Boolean);
    await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        experienceYears: parseFloat(formData.experienceYears) || 0,
        currentCtc: parseFloat(formData.currentCtc) || null,
        expectedCtc: parseFloat(formData.expectedCtc) || null,
        extractedSkills: JSON.stringify(skills),
      }),
    });
    setFormData({ name: "", email: "", phone: "", experienceYears: "", currentCtc: "", expectedCtc: "", extractedSkills: "" });
    setIsOpen(false);
    fetchCandidates();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/candidates?id=${id}`, { method: "DELETE" });
    fetchCandidates();
  };

  const handleMatchAll = async () => {
    setMatchingLoading(true);
    try {
      await fetch("/api/matches/batch", { method: "POST" });
      await fetchCandidates();
    } finally { setMatchingLoading(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div className="page-title">Candidates</div>
          <div className="page-sub">Manage talent pool and AI-powered matching</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="outline" size="sm" onClick={handleMatchAll} disabled={matchingLoading}>
            {matchingLoading ? "Matching..." : "Run AI Matching"}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button onClick={() => setIsOpen(true)} size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Candidate
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add New Candidate</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Experience (Years)</Label><Input type="number" step="0.5" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Current CTC ($)</Label><Input type="number" value={formData.currentCtc} onChange={e => setFormData({...formData, currentCtc: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Expected CTC ($)</Label><Input type="number" value={formData.expectedCtc} onChange={e => setFormData({...formData, expectedCtc: e.target.value})} /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Skills (comma-separated)</Label><Input value={formData.extractedSkills} onChange={e => setFormData({...formData, extractedSkills: e.target.value})} placeholder="React, TypeScript, Node.js" /></div>
                <Button type="submit" className="w-full">Add Candidate</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hot Talents */}
      {candidates.filter(c => c.hotTalent).length > 0 && (
        <div className="card-wireframe" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", borderColor: "var(--color-red-light)" }}>
          <Flame className="h-5 w-5" style={{ color: "#E24B4A", flexShrink: 0 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {candidates.filter(c => c.hotTalent).map(c => (
              <span key={c.id} className="tag tag-red" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Flame className="h-2.5 w-2.5" /> {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-wireframe">
        <div className="card-title-wireframe" style={{ marginBottom: "8px" }}>
          <Users className="h-4 w-4" style={{ color: "var(--color-primary)" }} /> All Candidates ({candidates.length})
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Name", "Contact", "Skills", "Exp", "CTC", "Status", "Hot", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding: "8px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {candidate.hotTalent && <Flame className="h-3.5 w-3.5" style={{ color: "#EF9F27" }} />}
                      {candidate.name}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-secondary)", fontSize: "11px" }}><Mail className="h-3 w-3" />{candidate.email}</div>
                    {candidate.phone && <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-tertiary)", fontSize: "11px", marginTop: "2px" }}><Phone className="h-3 w-3" />{candidate.phone}</div>}
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
                    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>${candidate.currentCtc || "-"}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>${candidate.expectedCtc || "-"}</div>
                  </td>
                  <td style={{ padding: "8px" }}><span className="tag tag-blue">{candidate.status}</span></td>
                  <td style={{ padding: "8px" }}>{candidate.hotTalent ? <Flame className="h-3.5 w-3.5" style={{ color: "#EF9F27" }} /> : <span style={{ color: "var(--color-text-tertiary)" }}>-</span>}</td>
                  <td style={{ padding: "8px" }}>
                    <Button variant="destructive" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleDelete(candidate.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No candidates yet. Click {'“'}Add Candidate{'”'} to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}