"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  User,
  Building,
  Award,
  Plus,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Brain,
  Code,
  Sparkles,
} from "lucide-react";

export default function InterviewFeedbackTab() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isHiringManager = userRole === "HIRING_TEAM";

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Feedback Form State
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [interviewer, setInterviewer] = useState<string>(session?.user?.name || "");
  const [technicalScore, setTechnicalScore] = useState<number>(80);
  const [behavioralScore, setBehavioralScore] = useState<number>(80);
  const [comments, setComments] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("HIRE");

  // Selected feedback for viewing details
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setMatches(data || []);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique vendors for filter dropdown
  const vendors = useMemo(() => {
    const list = new Set<string>();
    matches.forEach((m) => {
      if (m.demand?.vendor?.name) {
        list.add(m.demand.vendor.name);
      }
    });
    return Array.from(list);
  }, [matches]);

  // Candidates eligible for new feedback (processed by vendor, currently in interview/pending stage or doesn't have feedback yet)
  const pendingCandidates = useMemo(() => {
    return matches.filter((m) => !m.feedback);
  }, [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchVendor = m.demand?.vendor?.name || "";
      const matchStatus = m.feedback ? m.feedback.recommendation : "PENDING";
      const candidateName = m.candidate?.name || "";
      const jobTitle = m.demand?.title || "";

      const vendorMatches = selectedVendor === "ALL" || matchVendor === selectedVendor;
      const statusMatches =
        selectedStatus === "ALL" ||
        (selectedStatus === "PENDING" && !m.feedback) ||
        (m.feedback && m.feedback.recommendation === selectedStatus);

      const searchMatches =
        candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      return vendorMatches && statusMatches && searchMatches;
    });
  }, [matches, selectedVendor, selectedStatus, searchQuery]);

  // KPI Calculations
  const stats = useMemo(() => {
    const graded = matches.filter((m) => m.feedback);
    const count = graded.length;
    if (count === 0) {
      return { count: 0, avgTech: 0, avgBehav: 0, successRate: 0 };
    }

    const totalTech = graded.reduce((sum, m) => sum + m.feedback.technicalScore, 0);
    const totalBehav = graded.reduce((sum, m) => sum + m.feedback.behavioralScore, 0);
    const positive = graded.filter(
      (m) => m.feedback.recommendation === "STRONG_HIRE" || m.feedback.recommendation === "HIRE"
    ).length;

    return {
      count,
      avgTech: Math.round(totalTech / count),
      avgBehav: Math.round(totalBehav / count),
      successRate: Math.round((positive / count) * 100),
    };
  }, [matches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatchId,
          rating,
          interviewer,
          technicalScore,
          behavioralScore,
          comments,
          recommendation,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        // Reset form
        setSelectedMatchId("");
        setRating(5);
        setComments("");
        setRecommendation("HIRE");
        fetchFeedbacks();
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRecBadgeClass = (rec: string) => {
    switch (rec) {
      case "STRONG_HIRE":
        return "tag-green border border-green-500/20";
      case "HIRE":
        return "tag-blue border border-blue-500/20";
      case "NO_HIRE":
        return "tag-amber border border-amber-500/20";
      case "STRONG_NO_HIRE":
        return "tag-red border border-red-500/20";
      default:
        return "tag-secondary";
    }
  };

  const formatRecText = (rec: string) => {
    return rec ? rec.replace("_", " ") : "PENDING";
  };

  if (loading && matches.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Premium Hero Header */}
      <div className="premium-hero-header" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
              <span className="gradient-text">Interview Feedback</span> Center
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Assessments, technical ratings, and recommendations for candidates sourced via partner agencies.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              <Sparkles size={12} /> Feedback Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-primary)" } as React.CSSProperties}>
          <MessageSquare className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Assessments Recorded</div>
          <div className="kpi-val">{stats.count}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <TrendingUp size={12} /> Sourced from {vendors.length} vendors
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-blue-mid)" } as React.CSSProperties}>
          <Code className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Avg Technical Score</div>
          <div className="kpi-val" style={{ color: "var(--color-primary)" }}>{stats.avgTech}%</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.avgTech}%`, background: "var(--color-primary)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-purple)" } as React.CSSProperties}>
          <Brain className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Avg Behavioral Score</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>{stats.avgBehav}%</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.avgBehav}%`, background: "var(--color-purple)" }} />
          </div>
        </div>

        <div className="premium-kpi-card" style={{ "--kpi-color": "var(--color-success)" } as React.CSSProperties}>
          <Award className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Hire Recommendation Rate</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{stats.successRate}%</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.successRate}%`, background: "var(--color-success)" }} />
          </div>
        </div>
      </div>

      {/* Quick Actions and Filters */}
      <div className="card-wireframe glass-card-premium" style={{ marginBottom: "20px", padding: "14px", border: "1px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          
          {/* Filters Area */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              <Filter size={14} /> Filter:
            </div>
            
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "180px" }}>
              <Search size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
              <Input
                placeholder="Search candidate / job..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "26px", height: "30px", fontSize: "11px", width: "100%", borderRadius: "6px" }}
              />
            </div>

            {/* Vendor Filter */}
            <Select 
              value={selectedVendor} 
              onValueChange={(val) => setSelectedVendor(val || "ALL")}
            >
              <SelectTrigger style={{ height: "30px", width: "140px", fontSize: "11px", borderRadius: "6px" }}>
                <SelectValue placeholder="Vendor">
                  {selectedVendor === "ALL" ? "All Vendors" : selectedVendor}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Vendors</SelectItem>
                {vendors.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select 
              value={selectedStatus} 
              onValueChange={(val) => setSelectedStatus(val || "ALL")}
            >
              <SelectTrigger style={{ height: "30px", width: "140px", fontSize: "11px", borderRadius: "6px" }}>
                <SelectValue placeholder="Status">
                  {{ ALL: "All Outcomes", PENDING: "Pending Interview", STRONG_HIRE: "Strong Hire", HIRE: "Hire", NO_HIRE: "No Hire", STRONG_NO_HIRE: "Strong No Hire" }[selectedStatus]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Outcomes</SelectItem>
                <SelectItem value="PENDING">Pending Interview</SelectItem>
                <SelectItem value="STRONG_HIRE">Strong Hire</SelectItem>
                <SelectItem value="HIRE">Hire</SelectItem>
                <SelectItem value="NO_HIRE">No Hire</SelectItem>
                <SelectItem value="STRONG_NO_HIRE">Strong No Hire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Feedback button (Visible for Hiring Team & TA Team) */}
          <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <Button onClick={() => setIsOpen(true)} size="sm" style={{ height: "30px", fontSize: "11px", display: "flex", gap: "6px" }} disabled={pendingCandidates.length === 0}>
                <Plus size={14} /> Add Feedback
              </Button>
              <DialogContent className="max-w-2xl custom-dialog-content">
                <DialogHeader className="custom-dialog-header">
                  <DialogTitle style={{ fontFamily: "'Outfit', sans-serif", fontSize: "18px", fontWeight: "700" }}>
                    Record Candidate Interview Feedback
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Candidate Match */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Select Interviewed Candidate</Label>
                    <Select 
                      value={selectedMatchId} 
                      onValueChange={(val) => setSelectedMatchId(val || "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select candidate from queue...">
                          {selectedMatchId ? (() => { const match = pendingCandidates.find(m => m.id === selectedMatchId); return match ? `${match.candidate?.name} — ${match.demand?.title} (via ${match.demand?.vendor?.name || "Internal"})` : undefined; })() : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {pendingCandidates.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.candidate?.name} — {m.demand?.title} (via {m.demand?.vendor?.name || "Internal"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Interviewer */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Interviewer Name</Label>
                      <Input
                        value={interviewer}
                        onChange={(e) => setInterviewer(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Overall Recommendation</Label>
                      <Select 
                        value={recommendation} 
                        onValueChange={(val) => setRecommendation(val || "HIRE")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {{ STRONG_HIRE: "⭐ Strong Hire", HIRE: "✔ Hire", NO_HIRE: "✖ No Hire", STRONG_NO_HIRE: "🚫 Strong No Hire" }[recommendation] ?? "Select recommendation"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STRONG_HIRE">⭐ Strong Hire</SelectItem>
                          <SelectItem value="HIRE">✔ Hire</SelectItem>
                          <SelectItem value="NO_HIRE">✖ No Hire</SelectItem>
                          <SelectItem value="STRONG_NO_HIRE">🚫 Strong No Hire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Core Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Technical Score */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <Label className="text-xs font-semibold">Technical Score</Label>
                        <span className="text-xs font-bold text-primary">{technicalScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={technicalScore}
                        onChange={(e) => setTechnicalScore(Number(e.target.value))}
                        className="premium-slider"
                      />
                    </div>

                    {/* Behavioral Score */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <Label className="text-xs font-semibold">Behavioral Score</Label>
                        <span className="text-xs font-bold text-purple-600">{behavioralScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={behavioralScore}
                        onChange={(e) => setBehavioralScore(Number(e.target.value))}
                        className="premium-slider"
                      />
                    </div>
                  </div>

                  {/* Star Rating & Technical Rating Indicator */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      Candidate General Rating: <span className="font-bold text-amber-500">{rating} out of 5 Stars</span>
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            size={24}
                            className={star <= rating ? "fill-amber-500 stroke-amber-500" : "stroke-amber-400"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments / Details */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Interviewer Assessment Comments</Label>
                    <Textarea
                      rows={4}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Detail the candidate's core strengths, code evaluation results, architectural capabilities, and reasons for your recommendation..."
                      required
                    />
                  </div>

                  <DialogFooter className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !selectedMatchId}
                      className="px-6"
                    >
                      {submitting ? "Saving Assessment..." : "Submit Feedback"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

        </div>
      </div>

      {/* Main Feedback List Grid */}
      <div className="card-wireframe" style={{ border: "1px solid var(--color-border-tertiary)" }}>
        <div className="card-title-wireframe" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Award size={16} style={{ color: "var(--color-primary)" }} /> Sourced Candidates Evaluations ({filteredMatches.length})
          </span>
          <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
            Showing evaluated candidates from external vendors
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Candidate", "Vendor Sourced", "Job Position", "Technical", "Behavioral", "Rating", "Interviewer", "Outcome", "Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((m) => (
                <tr key={m.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }} className="hover:bg-slate-500/5 transition-colors">
                  
                  {/* Candidate Name */}
                  <td style={{ padding: "12px 10px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="avatar" style={{ width: "28px", height: "28px", fontSize: "11px", background: "var(--color-blue-pale)", color: "var(--color-primary)" }}>
                        {m.candidate?.name?.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <div>{m.candidate?.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", fontWeight: 400 }}>{m.candidate?.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Sourced Vendor */}
                  <td style={{ padding: "12px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Building size={12} style={{ color: "var(--color-text-tertiary)" }} />
                      <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>{m.demand?.vendor?.name || "Partner"}</span>
                    </div>
                  </td>

                  {/* Job Position */}
                  <td style={{ padding: "12px 10px", color: "var(--color-text-secondary)" }}>
                    <div style={{ fontWeight: 500 }}>{m.demand?.title}</div>
                    <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>Match Score: {m.matchScore}%</div>
                  </td>

                  {/* Technical Score */}
                  <td style={{ padding: "12px 10px" }}>
                    {m.feedback ? (
                      <div style={{ width: "100px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>
                          <span>Tech</span>
                          <span>{m.feedback.technicalScore}%</span>
                        </div>
                        <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${m.feedback.technicalScore}%`, background: "var(--color-primary)" }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: "10px" }}>—</span>
                    )}
                  </td>

                  {/* Behavioral Score */}
                  <td style={{ padding: "12px 10px" }}>
                    {m.feedback ? (
                      <div style={{ width: "100px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>
                          <span>Behav</span>
                          <span>{m.feedback.behavioralScore}%</span>
                        </div>
                        <div style={{ height: "4px", width: "100%", background: "var(--color-purple-light)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${m.feedback.behavioralScore}%`, background: "var(--color-purple)" }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: "10px" }}>—</span>
                    )}
                  </td>

                  {/* Stars Rating */}
                  <td style={{ padding: "12px 10px" }}>
                    {m.feedback ? (
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= m.feedback.rating ? "fill-amber-500 stroke-amber-500" : "stroke-amber-300"}
                          />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: "10px" }}>—</span>
                    )}
                  </td>

                  {/* Interviewer */}
                  <td style={{ padding: "12px 10px", color: "var(--color-text-secondary)" }}>
                    {m.feedback ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <User size={10} />
                        <span>{m.feedback.interviewer}</span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: "10px" }}>—</span>
                    )}
                  </td>

                  {/* Recommendation Tag */}
                  <td style={{ padding: "12px 10px" }}>
                    {m.feedback ? (
                      <span className={`tag ${getRecBadgeClass(m.feedback.recommendation)}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                        {formatRecText(m.feedback.recommendation)}
                      </span>
                    ) : (
                      <span className="tag tag-amber" style={{ fontSize: "9px", padding: "2px 6px" }}>
                        Interview Pending
                      </span>
                    )}
                  </td>

                  {/* View Details Button */}
                  <td style={{ padding: "12px 10px" }}>
                    {m.feedback ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] px-2 flex items-center gap-1"
                        onClick={() => setSelectedFeedback(m)}
                      >
                        Details <ChevronRight size={10} />
                      </Button>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)", fontSize: "10px" }}>Pending</span>
                    )}
                  </td>

                </tr>
              ))}

              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>
                    No vendor candidates found matching current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Detail View Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg custom-dialog-content">
          {selectedFeedback ? (
            <>
              <DialogHeader className="custom-dialog-header">
                <DialogTitle style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: "700" }}>
                  <Sparkles size={18} style={{ color: "var(--color-primary)" }} /> Interview Assessment Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4" style={{ fontSize: "12px" }}>
                {/* Header overview */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--color-background-secondary)", padding: "12px", borderRadius: "8px" }}>
                  <div className="avatar" style={{ width: "36px", height: "36px", fontSize: "12px", background: "var(--color-blue-pale)", color: "var(--color-primary)" }}>
                    {selectedFeedback.candidate?.name?.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{selectedFeedback.candidate?.name}</div>
                    <div style={{ color: "var(--color-text-secondary)" }}>
                      {selectedFeedback.demand?.title} (via {selectedFeedback.demand?.vendor?.name})
                    </div>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div style={{ background: "var(--color-background-secondary)", padding: "8px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>General Rating</div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2px", marginTop: "4px" }}>
                      <Star size={12} className="fill-amber-500 stroke-amber-500" />
                      <span style={{ fontSize: "14px", fontWeight: "700" }}>{selectedFeedback.feedback.rating}.0</span>
                    </div>
                  </div>
                  <div style={{ background: "var(--color-background-secondary)", padding: "8px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Technical</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginTop: "4px" }}>
                      {selectedFeedback.feedback.technicalScore}%
                    </div>
                  </div>
                  <div style={{ background: "var(--color-background-secondary)", padding: "8px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Behavioral</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-purple)", marginTop: "4px" }}>
                      {selectedFeedback.feedback.behavioralScore}%
                    </div>
                  </div>
                </div>

                {/* Interview info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "10px", background: "var(--color-background-secondary)", borderRadius: "6px" }}>
                  <div>
                    <span style={{ color: "var(--color-text-tertiary)" }}>Interviewer:</span>
                    <span style={{ fontWeight: 600, color: "var(--color-text-secondary)", marginLeft: "4px" }}>{selectedFeedback.feedback.interviewer}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-tertiary)" }}>Recommendation:</span>
                    <span className={`tag ${getRecBadgeClass(selectedFeedback.feedback.recommendation)}`} style={{ fontSize: "8px", padding: "1px 5px", marginLeft: "4px" }}>
                      {formatRecText(selectedFeedback.feedback.recommendation)}
                    </span>
                  </div>
                </div>

                {/* Comments box */}
                <div className="space-y-1">
                  <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Detailed Comments & Notes:</div>
                  <div style={{
                    padding: "12px",
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "6px",
                    lineHeight: "1.5",
                    color: "var(--color-text-secondary)",
                    maxHeight: "150px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}>
                    {selectedFeedback.feedback.comments}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFeedback(null)} className="px-4">
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : null}
          </DialogContent>
        </Dialog>
      </div>
  );
}
