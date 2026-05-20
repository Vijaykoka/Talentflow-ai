"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Plus, Flame, MapPin, DollarSign } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "tag tag-red",
  MEDIUM: "tag tag-amber",
  LOW: "tag tag-green",
};

function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills;
  try { return JSON.parse(skills); } catch { return []; }
}

export default function DemandsPage() {
  const [demands, setDemands] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  type FormData = {
    title: string; jdText: string; requiredSkills: string;
    rateMin: string; rateMax: string; location: string;
    priority: string; vendorId: string;
  };

  const [formData, setFormData] = useState<FormData>({
    title: "", jdText: "", requiredSkills: "",
    rateMin: "", rateMax: "", location: "",
    priority: "MEDIUM", vendorId: "",
  });

  useEffect(() => { fetchDemands(); fetchVendors(); }, []);

  const fetchDemands = async () => {
    const res = await fetch("/api/demands");
    setDemands(await res.json());
    setLoading(false);
  };

  const fetchVendors = async () => {
    const res = await fetch("/api/vendors");
    setVendors(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
    await fetch("/api/demands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, rateMin: parseFloat(formData.rateMin), rateMax: parseFloat(formData.rateMax), requiredSkills: JSON.stringify(skills) }),
    });
    setFormData({ title: "", jdText: "", requiredSkills: "", rateMin: "", rateMax: "", location: "", priority: "MEDIUM", vendorId: "" });
    setIsOpen(false);
    fetchDemands();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/demands?id=${id}`, { method: "DELETE" });
    fetchDemands();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/demands", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchDemands();
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
          <div className="page-title">Demands</div>
          <div className="page-sub">Manage open job demands and requirements</div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={() => setIsOpen(true)} size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Demand
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Demand</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Job Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Job Description</Label>
                <Textarea value={formData.jdText} onChange={e => setFormData({...formData, jdText: e.target.value})} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Required Skills (comma-separated)</Label>
                <Input value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rate Min ($/hr)</Label>
                  <Input type="number" value={formData.rateMin} onChange={e => setFormData({...formData, rateMin: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Rate Max ($/hr)</Label>
                  <Input type="number" value={formData.rateMax} onChange={e => setFormData({...formData, rateMax: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v!})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vendor (Optional)</Label>
                <Select value={formData.vendorId} onValueChange={v => setFormData({...formData, vendorId: v ?? ""})}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Demand</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="card-wireframe">
        <div className="card-title-wireframe" style={{ marginBottom: "8px" }}>
          <Briefcase className="h-4 w-4" style={{ color: "var(--color-primary)" }} /> All Demands ({demands.length})
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Title</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Priority</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Rate</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Location</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Skills</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Matches</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--color-text-secondary)", fontWeight: 500, fontSize: "11px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demands.map(demand => (
                <tr key={demand.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding: "8px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {demand.priority === "HIGH" && <Flame className="h-3.5 w-3.5" style={{ color: "#E24B4A" }} />}
                      {demand.title}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span className={PRIORITY_COLORS[demand.priority]}>{demand.priority}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <Select defaultValue={demand.status} onValueChange={v => handleStatusChange(demand.id, v)}>
                      <SelectTrigger className="w-[110px] h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                        <SelectItem value="OFFER">Offer</SelectItem>
                        <SelectItem value="FILLED">Filled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><DollarSign className="h-3 w-3" />${demand.rateMin}-${demand.rateMax}</span>
                  </td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin className="h-3 w-3" />{demand.location || "-"}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {Array.from(new Set(parseSkills(demand.requiredSkills))).slice(0, 2).map((skill: string) => (
                        <span key={skill} className="tag tag-blue">{skill}</span>
                      ))}
                      {parseSkills(demand.requiredSkills).length > 2 && (
                        <span className="tag" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>+{parseSkills(demand.requiredSkills).length - 2}</span>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: "8px", color: "var(--color-text-secondary)" }}>{demand._count?.matches || 0}</td>
                  <td style={{ padding: "8px" }}>
                    <Button variant="destructive" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleDelete(demand.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {demands.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>No demands yet. Click {'“'}Create Demand{'”'} to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}