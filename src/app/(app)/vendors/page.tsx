"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, Star, Mail, Phone } from "lucide-react";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "", contact: "", email: "", commissionRate: "",
  });

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    const res = await fetch("/api/vendors");
    setVendors(await res.json());
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name, contact: formData.contact,
        email: formData.email, commissionRate: parseFloat(formData.commissionRate) || 0.1,
      }),
    });
    setFormData({ name: "", contact: "", email: "", commissionRate: "" });
    setIsOpen(false);
    fetchVendors();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/vendors?id=${id}`, { method: "DELETE" });
    fetchVendors();
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
          <div className="page-title">Vendors</div>
          <div className="page-sub">Manage recruitment partners and track performance</div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={() => setIsOpen(true)} size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Vendor
          </Button>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5"><Label className="text-xs">Company Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
              <div className="space-y-1.5"><Label className="text-xs">Contact Person</Label><Input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Commission Rate (%)</Label><Input type="number" step="0.01" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: e.target.value})} placeholder="10" /></div>
              <Button type="submit" className="w-full">Add Vendor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendor Grid */}
      <div className="three-col">
        {vendors.map(vendor => (
          <div key={vendor.id} className="card-wireframe" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Top row: icon + name + delete */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="cand-avatar" style={{ background: "var(--color-blue-light)", color: "var(--color-primary)", width: "30px", height: "30px" }}>
                  {vendor.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--color-text-primary)" }}>{vendor.name}</span>
              </div>
              <Button variant="destructive" size="sm" className="h-6 text-[10px] px-2" onClick={() => handleDelete(vendor.id)}>Delete</Button>
            </div>

            {/* Contact info */}
            {vendor.contact && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "6px 8px", borderRadius: "var(--radius)" }}>
                <Phone className="h-3 w-3" style={{ color: "var(--color-text-tertiary)" }} /> {vendor.contact}
              </div>
            )}
            {vendor.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "6px 8px", borderRadius: "var(--radius)" }}>
                <Mail className="h-3 w-3" style={{ color: "var(--color-text-tertiary)" }} /> {vendor.email}
              </div>
            )}

            {/* Metrics */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", background: "var(--color-background-secondary)", borderRadius: "var(--radius)" }}>
              <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Commission</span>
              <span className="tag tag-blue">{(vendor.commissionRate * 100).toFixed(1)}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", background: "var(--color-background-secondary)", borderRadius: "var(--radius)" }}>
              <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Score</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Star className="h-3 w-3" style={{ color: "#EF9F27", fill: "#EF9F27" }} />
                <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--color-text-primary)" }}>{vendor.performanceScore.toFixed(1)}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "6px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ textAlign: "center", padding: "8px", borderRadius: "var(--radius)", background: "var(--color-background-secondary)" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)" }}>{vendor._count?.demands || 0}</div>
                <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>Demands</div>
              </div>
              <div style={{ textAlign: "center", padding: "8px", borderRadius: "var(--radius)", background: "var(--color-background-secondary)" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)" }}>{vendor._count?.hires || 0}</div>
                <div style={{ fontSize: "9px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>Hires</div>
              </div>
            </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <div className="card-wireframe" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px", color: "var(--color-text-tertiary)" }}>
            No vendors yet. Click &quot;Add Vendor&quot; to add one.
          </div>
        )}
      </div>
    </div>
  );
}