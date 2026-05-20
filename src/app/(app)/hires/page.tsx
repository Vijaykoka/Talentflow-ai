"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, Building2, Briefcase, Plus } from "lucide-react";
import { calculateMarginForecast } from "@/lib/matching";

export default function HiresPage() {
  const [hires, setHires] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    demandId: "", candidateId: "", vendorId: "",
    hiredRate: "", hiringCost: "", startDate: "",
  });

  useEffect(() => { setMounted(true); fetchData(); }, []);

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    try { return new Date(dateString).toLocaleDateString(); } catch { return "-"; }
  };

  const fetchData = async () => {
    const [h, d, c, v] = await Promise.all([
      fetch("/api/hires").then(r => r.json()),
      fetch("/api/demands").then(r => r.json()),
      fetch("/api/candidates").then(r => r.json()),
      fetch("/api/vendors").then(r => r.json()),
    ]);
    setHires(h); setDemands(d); setCandidates(c); setVendors(v);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/hires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        demandId: formData.demandId, candidateId: formData.candidateId,
        vendorId: formData.vendorId || null, hiredRate: parseFloat(formData.hiredRate),
        hiringCost: parseFloat(formData.hiringCost) || 0, startDate: formData.startDate,
      }),
    });
    setFormData({ demandId: "", candidateId: "", vendorId: "", hiredRate: "", hiringCost: "", startDate: "" });
    setIsOpen(false);
    fetchData();
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalMargin = hires.reduce((sum, h) => sum + (h.projectedMargin12m || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div className="page-title">Hires</div>
          <div className="page-sub">Track hires and margin forecasting</div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={() => setIsOpen(true)} size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Record Hire
          </Button>
          <DialogContent>
            <DialogHeader><DialogTitle>Record New Hire</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Demand (Job)</Label>
                <Select value={formData.demandId} onValueChange={v => setFormData({...formData, demandId: v!})}>
                  <SelectTrigger><SelectValue placeholder="Select demand" /></SelectTrigger>
                  <SelectContent>{demands.filter(d => d.status !== "FILLED").map(d => (<SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Candidate</Label>
                <Select value={formData.candidateId} onValueChange={v => setFormData({...formData, candidateId: v!})}>
                  <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                  <SelectContent>{candidates.filter(c => c.status !== "HIRED").map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vendor (Optional)</Label>
                <Select value={formData.vendorId} onValueChange={v => setFormData({...formData, vendorId: v ?? ""})}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Hired Rate ($/hr)</Label><Input type="number" value={formData.hiredRate} onChange={e => setFormData({...formData, hiredRate: e.target.value})} required /></div>
                <div className="space-y-1.5"><Label className="text-xs">Hiring Cost ($)</Label><Input type="number" value={formData.hiringCost} onChange={e => setFormData({...formData, hiringCost: e.target.value})} placeholder="6000" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Start Date</Label><Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required /></div>
              <Button type="submit" className="w-full">Record Hire</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats KPIs */}
      <div className="kpi-grid" style={{ marginBottom: "16px" }}>
        <div className="kpi">
          <div className="kpi-label">Total Hires</div>
          <div className="kpi-val">{hires.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Projected 12M</div>
          <div className="kpi-val" style={{ color: "var(--color-success-dark)" }}>{formatCurrency(totalMargin)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Margin</div>
          <div className="kpi-val">{hires.length > 0 ? formatCurrency(totalMargin / hires.length) : "$0"}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Vendors</div>
          <div className="kpi-val">{vendors.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card-wireframe" style={{ marginBottom: "16px" }}>
        <div className="card-title-wireframe" style={{ marginBottom: "8px" }}>
          <Briefcase className="h-4 w-4" style={{ color: "var(--color-primary)" }} /> Hire Records
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Candidate", "Demand", "Rate", "Cost", "Start", "Margin (12M)", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hires.map(hire => (
                <tr key={hire.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding: "8px", fontWeight: 500, color: "var(--color-text-primary)" }}>{hire.candidate?.name || "-"}</td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>{hire.demand?.title || "-"}</td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>${hire.hiredRate}/hr</td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>{formatCurrency(hire.hiringCost)}</td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>{formatDate(hire.startDate)}</td>
                  <td style={{ padding: "8px" }}>
                    <span className="tag tag-green">{formatCurrency(hire.projectedMargin12m || 0)}</span>
                  </td>
                  <td style={{ padding: "8px" }}><span className="tag tag-blue">{hire.status}</span></td>
                </tr>
              ))}
              {hires.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No hires recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Margin Forecast */}
      <div className="card-wireframe">
        <div className="card-title-wireframe" style={{ marginBottom: "8px" }}>
          <TrendingUp className="h-4 w-4" style={{ color: "var(--color-success-dark)" }} /> Margin Forecasting Examples
        </div>
        <div className="three-col">
          {[
            { billRate: 150, payRate: 100, hiringCost: 6000, label: "Senior Dev" },
            { billRate: 200, payRate: 140, hiringCost: 8000, label: "Tech Lead" },
            { billRate: 100, payRate: 70, hiringCost: 4000, label: "Junior Dev" },
          ].map((ex, i) => {
            const forecast = calculateMarginForecast(ex.billRate * 2080 / 12, ex.payRate * 2080 / 12, ex.hiringCost);
            return (
              <div key={i} style={{ padding: "14px", borderRadius: "var(--radius)", border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-green-light)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-primary)" }}>{ex.label}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>Bill: ${ex.billRate}/hr · Pay: ${ex.payRate}/hr · Cost: ${ex.hiringCost}</div>
                <hr className="divider" />
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-success-dark)" }}>{formatCurrency(forecast.projectedMargin12m)}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>Break-even: {forecast.breakEvenMonths.toFixed(1)} months</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}