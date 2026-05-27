"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTab } from "@/lib/context/tab-context";
import {
  IconFilePlus,
  IconMapPin,
  IconCurrencyDollar,
  IconTags,
  IconBriefcase,
  IconBuildingStore,
  IconBuilding,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

type FormData = {
  title: string;
  jdText: string;
  requiredSkills: string;
  rateMin: string;
  rateMax: string;
  location: string;
  priority: string;
  clientId: string;
  vendorId: string;
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#E24B4A",
  MEDIUM: "#EF9F27",
  LOW: "#639922",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export default function CreateDemandTab() {
  const { setActiveTab } = useTab();
  const [vendors, setVendors] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    title: "",
    jdText: "",
    requiredSkills: "",
    rateMin: "",
    rateMax: "",
    location: "",
    priority: "MEDIUM",
    clientId: "",
    vendorId: "",
  });

  useEffect(() => {
    fetchClientsAndVendors();
  }, []);

  const fetchClientsAndVendors = async () => {
    try {
      const [clientsRes, vendorsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/vendors")
      ]);
      setClients(await clientsRes.json());
      setVendors(await vendorsRes.json());
    } catch (err) {
      console.error("Failed to fetch clients or vendors", err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.clientId) newErrors.clientId = "Client Partner Account is required";
    if (!formData.rateMin) newErrors.rateMin = "Minimum rate is required";
    if (!formData.rateMax) newErrors.rateMax = "Maximum rate is required";
    if (formData.rateMin && formData.rateMax && parseFloat(formData.rateMin) > parseFloat(formData.rateMax)) {
      newErrors.rateMax = "Max rate must be greater than min rate";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const skills = formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rateMin: parseFloat(formData.rateMin),
          rateMax: parseFloat(formData.rateMax),
          requiredSkills: JSON.stringify(skills)
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create demand");
      }
      setFormData({ title: "", jdText: "", requiredSkills: "", rateMin: "", rateMax: "", location: "", priority: "MEDIUM", clientId: "", vendorId: "" });
      setActiveTab("demand");
    } catch (err: any) {
      console.error("Failed to create demand", err);
      alert(err.message || "An error occurred while creating the demand requisition.");
    } finally {
      setLoading(false);
    }
  };

  const previewSkills = formData.requiredSkills
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const selectedVendor = vendors.find(v => v.id === formData.vendorId);
  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="request-demand-container">
      <div className="request-demand-header">
        <div className="header-icon">
          <IconFilePlus size={22} />
        </div>
        <div>
          <h1 className="page-title">Request New Demand</h1>
          <p className="page-sub">Submit a job requisition to the talent pipeline</p>
        </div>
      </div>

      <div className="request-demand-grid">
        <div className="form-container-flow">
          <div className="form-card-section">
            <h3 className="form-section-title">
              <IconBriefcase size={16} />
              Role Details
            </h3>

            <div className="form-row" style={{ marginBottom: "24px" }}>
              <div className="form-group">
                <Label htmlFor="title">Job Title <span className="required">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: "" });
                  }}
                  placeholder="e.g. Senior Full Stack Developer"
                  className={errors.title ? "input-error" : ""}
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
              <div className="form-group">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Remote or San Francisco, CA"
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="jdText">Job Description</Label>
              <Textarea
                id="jdText"
                value={formData.jdText}
                onChange={e => setFormData({ ...formData, jdText: e.target.value })}
                rows={3}
                placeholder="Detail key responsibilities, architecture stack, and deliverables..."
              />
            </div>
          </div>

          <div className="form-card-section">
            <h3 className="form-section-title">
              <IconTags size={16} />
              Skills & Qualifications
            </h3>

            <div className="form-group">
              <Label htmlFor="skills">Required Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.requiredSkills}
                onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })}
                placeholder="React, TypeScript, Node.js, Next.js"
              />
              {previewSkills.length > 0 && (
                <div className="skills-preview">
                  {previewSkills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-card-section">
            <h3 className="form-section-title">
              <IconCurrencyDollar size={16} />
              Compensation & Priority
            </h3>

            <div className="form-row three-col">
              <div className="form-group">
                <Label htmlFor="rateMin">Rate Min ($/hr) <span className="required">*</span></Label>
                <Input
                  id="rateMin"
                  type="number"
                  value={formData.rateMin}
                  onChange={e => {
                    setFormData({ ...formData, rateMin: e.target.value });
                    if (errors.rateMin) setErrors({ ...errors, rateMin: "" });
                  }}
                  placeholder="100"
                  className={errors.rateMin ? "input-error" : ""}
                />
                {errors.rateMin && <span className="error-text">{errors.rateMin}</span>}
              </div>
              <div className="form-group">
                <Label htmlFor="rateMax">Rate Max ($/hr) <span className="required">*</span></Label>
                <Input
                  id="rateMax"
                  type="number"
                  value={formData.rateMax}
                  onChange={e => {
                    setFormData({ ...formData, rateMax: e.target.value });
                    if (errors.rateMax) setErrors({ ...errors, rateMax: "" });
                  }}
                  placeholder="150"
                  className={errors.rateMax ? "input-error" : ""}
                />
                {errors.rateMax && <span className="error-text">{errors.rateMax}</span>}
              </div>
              <div className="form-group">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={v => setFormData({ ...formData, priority: v! })}
                >
                  <SelectTrigger id="priority" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                      <span 
                        style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          backgroundColor: { HIGH: "#E24B4A", MEDIUM: "#EF9F27", LOW: "#639922" }[formData.priority] || "#888",
                          display: "inline-block",
                          flexShrink: 0
                        }} 
                      />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {{ HIGH: "High Priority", MEDIUM: "Medium Priority", LOW: "Low Priority" }[formData.priority] || "Select priority"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#E24B4A", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px" }}>High Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF9F27", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px" }}>Medium Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="LOW">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#639922", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px" }}>Low Priority</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="form-card-section">
            <h3 className="form-section-title">
              <IconBuilding size={16} />
              Client Partner Account
            </h3>

            <div className="form-group">
              <Label htmlFor="client">Target Client Account <span className="required">*</span></Label>
              <Select 
                value={formData.clientId} 
                onValueChange={v => {
                  setFormData({ ...formData, clientId: v! });
                  if (errors.clientId) setErrors({ ...errors, clientId: "" });
                }}
              >
                <SelectTrigger id="client" className={errors.clientId ? "input-error" : ""} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                    <IconBuilding size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {formData.clientId ? clients.find(c => c.id === formData.clientId)?.name ?? "Select Client Account" : "Select Client Account"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.clientId && <span className="error-text">{errors.clientId}</span>}
            </div>
          </div>

          <div className="form-card-section">
            <h3 className="form-section-title">
              <IconBuildingStore size={16} />
              Recruiting Partner
            </h3>

            <div className="form-group">
              <Label htmlFor="vendor">Associated Recruiting Partner (Optional)</Label>
              <Select 
                value={formData.vendorId || "internal"} 
                onValueChange={v => setFormData({ ...formData, vendorId: v === "internal" || !v ? "" : v })}
              >
                <SelectTrigger id="vendor" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                    <IconBuildingStore size={14} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {formData.vendorId ? vendors.find(vendor => vendor.id === formData.vendorId)?.name ?? "Internal Sourcing (No Vendor)" : "Internal Sourcing (No Vendor)"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Sourcing (No Vendor)</SelectItem>
                  {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="form-actions-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("demand")}
            >
              <IconX size={16} />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="submit-btn"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <IconCheck size={16} />
                  Submit Requisition
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="preview-card">
          <div className="preview-header">
            <IconFilePlus size={16} />
            Demand Preview
          </div>

          <div className="preview-content">
            <div className="preview-row">
              <span
                className="priority-indicator"
                style={{ background: PRIORITY_COLORS[formData.priority] || "#888" }}
              />
              <span className="preview-title">{formData.title || "Untitled Requisition"}</span>
              <span
                className={`priority-badge priority-${formData.priority.toLowerCase()}`}
              >
                {PRIORITY_LABELS[formData.priority]}
              </span>
            </div>

            <div className="preview-details">
              <div className="preview-detail">
                <IconMapPin size={14} />
                <span>{formData.location || "Remote / Unspecified"}</span>
              </div>
              <div className="preview-detail">
                <IconCurrencyDollar size={14} />
                <span>${formData.rateMin || "0"} - ${formData.rateMax || "0"}/hr</span>
              </div>
            </div>

            {previewSkills.length > 0 && (
              <div className="preview-skills">
                {previewSkills.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="preview-skill-tag">{skill}</span>
                ))}
                {previewSkills.length > 4 && (
                  <span className="preview-skill-tag more">+{previewSkills.length - 4} more</span>
                )}
              </div>
            )}

            <div className="preview-footer" style={{ flexDirection: "column", gap: "8px", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div className="preview-vendor" style={{ fontSize: "11px", gap: "4px" }}>
                  <IconBuilding size={12} style={{ color: "var(--color-primary)" }} />
                  <span style={{ fontWeight: 600 }}>Client:</span> {selectedClient ? selectedClient.name : "Unspecified Client"}
                </div>
                <span className="preview-status">Open</span>
              </div>
              <div className="preview-vendor" style={{ fontSize: "11px", gap: "4px" }}>
                <IconBuildingStore size={12} style={{ color: "var(--color-text-secondary)" }} />
                <span style={{ fontWeight: 600 }}>Vendor:</span> {selectedVendor ? selectedVendor.name : "Internal Sourcing"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .request-demand-container {
          max-width: 1200px;
        }

        .request-demand-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary), #378ADD);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(24, 95, 165, 0.3);
        }

        .request-demand-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .request-demand-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-container-flow {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-card-section {
          background: var(--color-background-primary);
          border: 1px solid var(--color-border-tertiary);
          border-radius: 12px;
          padding: 28px 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease-in-out;
        }

        .form-card-section:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          border-color: rgba(24, 95, 165, 0.15);
        }

        .form-section {
          padding: 28px 32px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }

        .form-section-title svg {
          color: var(--color-primary);
        }

        #priority, #client, #vendor {
          min-height: 42px;
          background: var(--color-background-primary) !important;
          border: 1.5px solid var(--color-border-tertiary) !important;
          border-radius: 8px !important;
          font-size: 13px !important;
          padding: 10px 14px !important;
          transition: all 0.2s ease-in-out !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }

        #priority:hover, #client:hover, #vendor:hover {
          border-color: var(--color-primary) !important;
        }

        #priority:focus, #client:focus, #vendor:focus {
          outline: none !important;
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.15) !important;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-row.three-col {
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 640px) {
          .form-row, .form-row.three-col {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 4px;
        }

        .form-section input,
        .form-section textarea {
          padding: 10px 14px !important;
          font-size: 13px !important;
          border-radius: 8px !important;
          border: 1.5px solid var(--color-border-tertiary) !important;
          background: var(--color-background-primary) !important;
          transition: all 0.2s ease-in-out !important;
        }

        .form-section input:hover,
        .form-section textarea:hover {
          border-color: var(--color-primary) !important;
        }

        .form-section input:focus,
        .form-section textarea:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.15) !important;
          outline: none !important;
        }

        .required {
          color: var(--color-error);
        }

        .error-text {
          font-size: 11px;
          color: var(--color-error);
        }

        .input-error {
          border-color: var(--color-error) !important;
        }

        .skills-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .skill-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          background: var(--color-blue-light);
          color: var(--color-primary);
          border-radius: 6px;
          border: 0.5px solid rgba(24, 95, 165, 0.15);
        }

        .form-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding: 20px 32px;
          background: var(--color-background-primary);
          border: 1px solid var(--color-border-tertiary);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .submit-btn {
          background: linear-gradient(135deg, var(--color-primary), #378ADD);
          color: white;
          border: none;
          font-weight: 500;
        }

        .submit-btn:hover {
          opacity: 0.9;
        }

        .preview-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--radius);
          overflow: hidden;
          position: sticky;
          top: 16px;
          min-height: 320px;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
          background: var(--color-background-secondary);
          border-bottom: 0.5px solid var(--color-border-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .preview-content {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 240px;
        }

        .preview-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .priority-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .preview-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          flex: 1;
          line-height: 1.4;
        }

        .priority-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .priority-high {
          background: var(--color-red-light);
          color: var(--color-error-dark);
        }

        .priority-medium {
          background: var(--color-amber-light);
          color: var(--color-warning-dark);
        }

        .priority-low {
          background: var(--color-green-light);
          color: var(--color-success-dark);
        }

        .preview-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-detail {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--color-text-secondary);
          padding: 8px 12px;
          background: var(--color-background-secondary);
          border-radius: 8px;
        }

        .preview-detail svg {
          color: var(--color-primary);
        }

        .preview-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .preview-skill-tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 500;
          background: var(--color-background-tertiary);
          color: var(--color-text-secondary);
          border-radius: 6px;
        }

        .preview-skill-tag.more {
          background: var(--color-blue-light);
          color: var(--color-primary);
        }

        .preview-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--color-border-tertiary);
          margin-top: auto;
        }

        .preview-vendor {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .preview-status {
          font-size: 11px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 6px;
          background: var(--color-primary);
          color: white;
        }
      `}</style>
    </div>
  );
}