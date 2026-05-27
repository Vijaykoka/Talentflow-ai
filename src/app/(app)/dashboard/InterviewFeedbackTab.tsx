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
  Calendar,
  Clock,
  Video,
  Send,
  Trash2,
  AlertCircle
} from "lucide-react";

export default function InterviewFeedbackTab() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Active view tab state: "schedule" | "evaluations"
  const [activeSubTab, setActiveSubTab] = useState<"schedule" | "evaluations">("schedule");

  const [matches, setMatches] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters (Evaluations)
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

  // Scheduling Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedMatchId, setSchedMatchId] = useState<string>("");
  const [schedDate, setSchedDate] = useState<string>("");
  const [schedTime, setSchedTime] = useState<string>("");
  const [schedPanelName, setSchedPanelName] = useState<string>("");
  const [schedPanelEmails, setSchedPanelEmails] = useState<string>("");
  const [schedMeetingLink, setSchedMeetingLink] = useState<string>("");
  const [schedulingSubmitting, setSchedulingSubmitting] = useState(false);

  // KPI Dialog States
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false);
  const [kpiDialogType, setKpiDialogType] = useState<"assessments" | "tech_score" | "scheduled" | "rec_rate" | null>(null);

  const openKpiDialog = (type: "assessments" | "tech_score" | "scheduled" | "rec_rate") => {
    setKpiDialogType(type);
    setIsKpiDialogOpen(true);
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchInterviews();
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

  const fetchInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const res = await fetch("/api/interviews");
      const data = await res.json();
      setInterviews(data || []);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setLoadingInterviews(false);
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

  // Matches eligible for scheduling
  const eligibleForScheduling = useMemo(() => {
    // Only allow scheduling candidates who have no feedback yet
    return matches.filter((m) => !m.feedback);
  }, [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchVendor = m.demand?.vendor?.name || "";
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
        
        // Also update any scheduled interview to COMPLETED
        const linkedInterview = interviews.find(
          (i) => i.matchId === selectedMatchId && i.status === "SCHEDULED"
        );
        if (linkedInterview) {
          await fetch("/api/interviews", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: linkedInterview.id, status: "COMPLETED" }),
          });
        }

        fetchFeedbacks();
        fetchInterviews();
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedMatchId || !schedDate || !schedTime || !schedPanelName) return;

    setSchedulingSubmitting(true);
    const scheduledAt = `${schedDate}T${schedTime}:00`;
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: schedMatchId,
          scheduledAt,
          panelName: schedPanelName,
          panelEmails: schedPanelEmails,
          meetingLink: schedMeetingLink,
        }),
      });

      if (res.ok) {
        setIsScheduleModalOpen(false);
        // Reset state
        setSchedMatchId("");
        setSchedDate("");
        setSchedTime("");
        setSchedPanelName("");
        setSchedPanelEmails("");
        setSchedMeetingLink("");
        fetchInterviews();
        fetchFeedbacks();
      }
    } catch (err) {
      console.error("Failed to schedule interview:", err);
    } finally {
      setSchedulingSubmitting(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled interview?")) return;
    try {
      const res = await fetch("/api/interviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "CANCELLED" }),
      });
      if (res.ok) {
        fetchInterviews();
        fetchFeedbacks();
      }
    } catch (err) {
      console.error("Failed to cancel interview:", err);
    }
  };

  const handleSendReminder = (panel: string, candidate: string) => {
    alert(`Reminder notification successfully sent to interview panel (${panel}) for candidate ${candidate}.`);
  };

  const handleRecordFeedbackForMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setIsOpen(true);
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
              <span className="gradient-text">Interview & Feedback</span> Management
            </h1>
            <p className="page-sub" style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
              Schedule interviews, assign technical evaluation panels, and record candidate scorecards.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge-blue pulse-glow" style={{ padding: "6px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600 }}>
              <Sparkles size={12} /> Management Hub Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div 
          className="premium-kpi-card" 
          onClick={() => openKpiDialog("assessments")}
          style={{ "--kpi-color": "var(--color-primary)", cursor: "pointer" } as React.CSSProperties}
        >
          <MessageSquare className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Assessments Recorded</div>
          <div className="kpi-val">{stats.count}</div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <TrendingUp size={12} /> Sourced from {vendors.length} vendors
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => openKpiDialog("tech_score")}
          style={{ "--kpi-color": "var(--color-blue-mid)", cursor: "pointer" } as React.CSSProperties}
        >
          <Code className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Avg Technical Score</div>
          <div className="kpi-val" style={{ color: "var(--color-primary)" }}>{stats.avgTech}%</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-blue-pale)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.avgTech}%`, background: "var(--color-primary)" }} />
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => openKpiDialog("scheduled")}
          style={{ "--kpi-color": "var(--color-purple)", cursor: "pointer" } as React.CSSProperties}
        >
          <Brain className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Scheduled Interviews</div>
          <div className="kpi-val" style={{ color: "var(--color-purple)" }}>
            {interviews.filter((i) => i.status === "SCHEDULED").length} Active
          </div>
          <div className="kpi-delta up" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <Calendar size={12} /> Total {interviews.length} sessions
          </div>
        </div>

        <div 
          className="premium-kpi-card" 
          onClick={() => openKpiDialog("rec_rate")}
          style={{ "--kpi-color": "var(--color-success)", cursor: "pointer" } as React.CSSProperties}
        >
          <Award className="premium-kpi-icon" size={40} />
          <div className="kpi-label">Hire Recommendation Rate</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{stats.successRate}%</div>
          <div style={{ height: "4px", width: "100%", background: "var(--color-green-light)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.successRate}%`, background: "var(--color-success)" }} />
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={() => setActiveSubTab("schedule")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            background: activeSubTab === "schedule" ? "var(--color-primary)" : "var(--color-background-secondary)",
            color: activeSubTab === "schedule" ? "#fff" : "var(--color-text-secondary)",
            border: "1px solid " + (activeSubTab === "schedule" ? "var(--color-primary)" : "var(--color-border-tertiary)"),
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Calendar size={14} /> Active Schedule & Panels
        </button>
        <button 
          onClick={() => setActiveSubTab("evaluations")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            background: activeSubTab === "evaluations" ? "var(--color-primary)" : "var(--color-background-secondary)",
            color: activeSubTab === "evaluations" ? "#fff" : "var(--color-text-secondary)",
            border: "1px solid " + (activeSubTab === "evaluations" ? "var(--color-primary)" : "var(--color-border-tertiary)"),
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Award size={14} /> Evaluations & Feedback
        </button>
      </div>

      {/* SUBTAB 1: INTERVIEW SCHEDULE */}
      {activeSubTab === "schedule" && (
        <div className="space-y-4">
          <div className="card-wireframe glass-card-premium" style={{ border: "1px solid var(--color-border-tertiary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "10px", marginBottom: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700" }}>
                <Calendar size={16} style={{ color: "var(--color-purple)" }} /> Scheduled Interviews Timeline & Panels
              </span>
              
              <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                <Button onClick={() => setIsScheduleModalOpen(true)} size="sm" style={{ height: "30px", fontSize: "11px", display: "flex", gap: "6px" }} disabled={eligibleForScheduling.length === 0}>
                  <Plus size={14} /> Schedule Interview
                </Button>
                <DialogContent className="max-w-md custom-dialog-content">
                  <DialogHeader className="custom-dialog-header">
                    <DialogTitle style={{ fontSize: "16px", fontWeight: "700" }}>
                      Schedule Technical Interview
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Select Matched Candidate</Label>
                      <Select 
                        value={schedMatchId} 
                        onValueChange={(val) => setSchedMatchId(val || "")}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Pick candidate match..." />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibleForScheduling.map((m) => (
                            <SelectItem key={m.id} value={m.id} style={{ fontSize: "11px" }}>
                              {m.candidate?.name} — {m.demand?.title} ({m.demand?.client?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Date</Label>
                        <Input 
                          type="date"
                          value={schedDate}
                          onChange={(e) => setSchedDate(e.target.value)}
                          required
                          style={{ fontSize: "11px" }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Time</Label>
                        <Input 
                          type="time"
                          value={schedTime}
                          onChange={(e) => setSchedTime(e.target.value)}
                          required
                          style={{ fontSize: "11px" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Technical Panel Assigned</Label>
                      <Input 
                        placeholder="e.g. Deepak S., John D."
                        value={schedPanelName}
                        onChange={(e) => setSchedPanelName(e.target.value)}
                        required
                        style={{ fontSize: "11px" }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Panel Email Address(es)</Label>
                      <Input 
                        placeholder="comma separated emails"
                        value={schedPanelEmails}
                        onChange={(e) => setSchedPanelEmails(e.target.value)}
                        style={{ fontSize: "11px" }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Video Coordinate Link (Google Meet/Teams)</Label>
                      <Input 
                        placeholder="meet.google.com/abc-xyz-123"
                        value={schedMeetingLink}
                        onChange={(e) => setSchedMeetingLink(e.target.value)}
                        style={{ fontSize: "11px" }}
                      />
                    </div>

                    <DialogFooter className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsScheduleModalOpen(false)}
                        className="px-4 text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={schedulingSubmitting || !schedMatchId}
                        className="px-6 text-xs h-8"
                      >
                        {schedulingSubmitting ? "Scheduling..." : "Create Schedule"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loadingInterviews ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                  <div style={{ width: "24px", height: "24px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              ) : interviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
                  No interviews scheduled. Get started by clicking "Schedule Interview".
                </div>
              ) : (
                interviews.map((int: any, idx: number) => {
                  const candidate = int.match?.candidate;
                  const demand = int.match?.demand;
                  const dateStr = new Date(int.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  const timeStr = new Date(int.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={int.id} className="cand-row premium-interactive-row" style={{ padding: "14px 16px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ padding: "8px 12px", background: int.status === "COMPLETED" ? "var(--color-green-light)" : int.status === "CANCELLED" ? "var(--color-red-light)" : "var(--color-blue-light)", color: int.status === "COMPLETED" ? "var(--color-success-dark)" : int.status === "CANCELLED" ? "var(--color-error-dark)" : "var(--color-primary)", borderRadius: "8px", fontWeight: 800, fontSize: "11px", minWidth: "120px", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "12px" }}>{dateStr}</span>
                          <span style={{ opacity: 0.8, fontSize: "10px" }}>{timeStr}</span>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                            {candidate?.name || "Unknown Candidate"}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "3px" }}>
                            Requisition: <strong style={{ color: "var(--color-text-secondary)" }}>{demand?.title}</strong> for Client: <strong>{demand?.client?.name || "N/A"}</strong>
                          </div>
                          {int.meetingLink && (
                            <div style={{ fontSize: "11px", color: "var(--color-primary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Video size={12} />
                              <a href={int.meetingLink.startsWith("http") ? int.meetingLink : `https://${int.meetingLink}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", fontWeight: 600 }}>
                                {int.meetingLink}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Assigned Technical Panel:</div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>{int.panelName}</div>
                        </div>

                        <span className="tag" style={{ 
                          background: int.status === "COMPLETED" ? "var(--color-green-light)" : int.status === "CANCELLED" ? "var(--color-red-light)" : "var(--color-amber-light)", 
                          color: int.status === "COMPLETED" ? "var(--color-success-dark)" : int.status === "CANCELLED" ? "var(--color-error-dark)" : "var(--color-warning-dark)",
                          fontWeight: 700,
                          fontSize: "10px" 
                        }}>
                          {int.status}
                        </span>

                        <div style={{ display: "flex", gap: "8px" }}>
                          {int.status === "SCHEDULED" && (
                            <>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleRecordFeedbackForMatch(int.matchId)}
                                style={{ height: "26px", fontSize: "10px", padding: "0 8px" }}
                              >
                                Record Feedback
                              </Button>
                              <button 
                                onClick={() => handleSendReminder(int.panelName, candidate?.name)}
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
                              <button 
                                onClick={() => handleCancelInterview(int.id)}
                                style={{
                                  background: "none",
                                  border: "1px solid var(--color-red-light)",
                                  borderRadius: "6px",
                                  padding: "4px",
                                  color: "var(--color-error-dark)",
                                  cursor: "pointer"
                                }}
                                title="Cancel Interview"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: EVALUATIONS & FEEDBACK DIRECTORY */}
      {activeSubTab === "evaluations" && (
        <div>
          {/* Quick Filters */}
          <div className="card-wireframe glass-card-premium" style={{ marginBottom: "20px", padding: "14px", border: "1px solid var(--color-border-tertiary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  <Filter size={14} /> Filter:
                </div>
                
                <div style={{ position: "relative", minWidth: "180px" }}>
                  <Search size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                  <Input
                    placeholder="Search candidate / job..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "26px", height: "30px", fontSize: "11px", width: "100%", borderRadius: "6px" }}
                  />
                </div>

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
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Select Interviewed Candidate</Label>
                        <Select 
                          value={selectedMatchId} 
                          onValueChange={(val) => setSelectedMatchId(val || "")}
                        >
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue placeholder="Select candidate from queue...">
                              {selectedMatchId ? (() => { const match = pendingCandidates.find(m => m.id === selectedMatchId); return match ? `${match.candidate?.name} — ${match.demand?.title} (via ${match.demand?.vendor?.name || "Internal"})` : undefined; })() : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {pendingCandidates.map((m) => (
                              <SelectItem key={m.id} value={m.id} style={{ fontSize: "11px" }}>
                                {m.candidate?.name} — {m.demand?.title} (via {m.demand?.vendor?.name || "Internal"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Interviewer Name</Label>
                          <Input
                            value={interviewer}
                            onChange={(e) => setInterviewer(e.target.value)}
                            placeholder="e.g. John Doe"
                            required
                          />
                        </div>

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

                      <div className="grid grid-cols-2 gap-4">
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

          {/* Evaluations Directory */}
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

                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Building size={12} style={{ color: "var(--color-text-tertiary)" }} />
                          <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>{m.demand?.vendor?.name || "Partner"}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px", color: "var(--color-text-secondary)" }}>
                        <div style={{ fontWeight: 500 }}>{m.demand?.title}</div>
                        <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>Match Score: {m.matchScore}%</div>
                      </td>

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
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2 flex items-center gap-1"
                            onClick={() => handleRecordFeedbackForMatch(m.id)}
                          >
                            Add Feedback <ChevronRight size={10} />
                          </Button>
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
        </div>
      )}

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

      {/* Premium KPI Dialogs */}
      <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
        <DialogContent className="custom-dialog-content">
          <DialogHeader className="custom-dialog-header">
            <DialogTitle>
              {kpiDialogType === "assessments" && `Recorded Candidate Evaluations (${matches.filter(m => m.feedback).length})`}
              {kpiDialogType === "tech_score" && `Technical Evaluation Performance Rank`}
              {kpiDialogType === "scheduled" && `Active Scheduled Interview Panels (${interviews.filter(i => i.status === "SCHEDULED").length})`}
              {kpiDialogType === "rec_rate" && `Assessment Outcomes & Recommendation Rate (${stats.successRate}%)`}
            </DialogTitle>
          </DialogHeader>
          <div className="custom-dialog-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            
            {kpiDialogType === "assessments" && (
              <div>
                {matches.filter(m => m.feedback).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No recorded assessments found.</div>
                ) : (
                  matches.filter(m => m.feedback).map((m: any, index: number) => (
                    <div key={m.id} className="popup-row">
                      <div className="popup-avatar" style={{ background: "var(--color-blue-light)", color: "var(--color-primary)" }}>
                        {m.candidate?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{m.candidate?.name}</div>
                        <div className="popup-sub" style={{ fontSize: "11px", marginTop: "2px" }}>
                          Job: <strong>{m.demand?.title}</strong> (via {m.demand?.vendor?.name})
                          <span style={{ color: "var(--color-border-tertiary)", margin: "0 6px" }}>•</span>
                          Interviewer: {m.feedback.interviewer}
                        </div>
                      </div>
                      <div className="popup-stat" style={{ textAlign: "right", minWidth: "110px" }}>
                        <span className={`tag ${getRecBadgeClass(m.feedback.recommendation)}`} style={{ fontSize: "9px" }}>
                          {formatRecText(m.feedback.recommendation)}
                        </span>
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                          Rating: {m.feedback.rating}★
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {kpiDialogType === "tech_score" && (
              <div>
                {matches.filter(m => m.feedback).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No technical scores available.</div>
                ) : (
                  [...matches.filter(m => m.feedback)].sort((a, b) => b.feedback.technicalScore - a.feedback.technicalScore).map((m: any) => (
                    <div key={m.id} className="popup-row">
                      <div className="popup-avatar" style={{ background: "var(--color-purple-light)", color: "var(--color-purple)" }}>
                        {m.candidate?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{m.candidate?.name}</div>
                        <div className="popup-sub" style={{ fontSize: "11px", marginTop: "2px" }}>
                          Job: <strong>{m.demand?.title}</strong>
                          <span style={{ color: "var(--color-border-tertiary)", margin: "0 6px" }}>•</span>
                          Behav Score: {m.feedback.behavioralScore}%
                        </div>
                      </div>
                      <div className="popup-stat" style={{ textAlign: "right", minWidth: "110px" }}>
                        <span className="popup-stat-val" style={{ color: "var(--color-primary)", fontSize: "14px", fontWeight: "700" }}>
                          {m.feedback.technicalScore}%
                        </span>
                        <span className="popup-stat-label">Technical Score</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {kpiDialogType === "scheduled" && (
              <div>
                {interviews.filter(i => i.status === "SCHEDULED").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No scheduled interviews active.</div>
                ) : (
                  interviews.filter(i => i.status === "SCHEDULED").map((int: any) => {
                    const candidate = int.match?.candidate;
                    const demand = int.match?.demand;
                    const dateStr = new Date(int.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    const timeStr = new Date(int.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={int.id} className="popup-row">
                        <div className="popup-avatar" style={{ background: "var(--color-blue-light)", color: "var(--color-primary)" }}>
                          {candidate?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="popup-info">
                          <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{candidate?.name}</div>
                          <div className="popup-sub" style={{ fontSize: "11px", marginTop: "2px" }}>
                            Panel: <strong>{int.panelName}</strong>
                            <span style={{ color: "var(--color-border-tertiary)", margin: "0 6px" }}>•</span>
                            Time: {dateStr} at {timeStr}
                          </div>
                        </div>
                        <div className="popup-stat" style={{ textAlign: "right" }}>
                          <span className="tag tag-amber" style={{ fontSize: "9px" }}>
                            {int.status}
                          </span>
                          <button 
                            onClick={() => handleSendReminder(int.panelName, candidate?.name)}
                            style={{
                              background: "none",
                              border: "1px solid var(--color-border-tertiary)",
                              borderRadius: "4px",
                              padding: "2px 6px",
                              fontSize: "9px",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                              cursor: "pointer",
                              display: "block",
                              marginTop: "4px",
                              marginLeft: "auto"
                            }}
                          >
                            Ping Panel
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {kpiDialogType === "rec_rate" && (
              <div>
                <div style={{ background: "var(--color-background-secondary)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "11px" }}>
                  <div style={{ fontWeight: "700", marginBottom: "8px" }}>Recommendation Breakdown:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>⭐ Strong Hire: <strong>{matches.filter(m => m.feedback?.recommendation === "STRONG_HIRE").length}</strong></div>
                    <div>✔ Hire: <strong>{matches.filter(m => m.feedback?.recommendation === "HIRE").length}</strong></div>
                    <div>✖ No Hire: <strong>{matches.filter(m => m.feedback?.recommendation === "NO_HIRE").length}</strong></div>
                    <div>🚫 Strong No Hire: <strong>{matches.filter(m => m.feedback?.recommendation === "STRONG_NO_HIRE").length}</strong></div>
                  </div>
                </div>

                <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "12px" }}>Shortlisted Hire Candidates:</div>
                {matches.filter(m => m.feedback?.recommendation === "STRONG_HIRE" || m.feedback?.recommendation === "HIRE").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px", color: "var(--color-text-tertiary)", fontSize: "11px" }}>No candidate hires recommended yet.</div>
                ) : (
                  matches.filter(m => m.feedback?.recommendation === "STRONG_HIRE" || m.feedback?.recommendation === "HIRE").map((m: any) => (
                    <div key={m.id} className="popup-row">
                      <div className="popup-avatar" style={{ background: "var(--color-green-light)", color: "var(--color-success-dark)" }}>
                        {m.candidate?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="popup-info">
                        <div className="popup-title" style={{ fontSize: "14px", fontWeight: "600" }}>{m.candidate?.name}</div>
                        <div className="popup-sub" style={{ fontSize: "11px", marginTop: "2px" }}>
                          Requisition: <strong>{m.demand?.title}</strong>
                          <span style={{ color: "var(--color-border-tertiary)", margin: "0 6px" }}>•</span>
                          Tech Score: {m.feedback.technicalScore}%
                        </div>
                      </div>
                      <div className="popup-stat" style={{ textAlign: "right", minWidth: "110px" }}>
                        <span className={`tag ${getRecBadgeClass(m.feedback.recommendation)}`} style={{ fontSize: "9px" }}>
                          {formatRecText(m.feedback.recommendation)}
                        </span>
                        <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                          Rating: {m.feedback.rating}★
                        </div>
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
