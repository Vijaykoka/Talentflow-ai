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
    vendorId: "",
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      setVendors(await res.json());
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
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
      await fetch("/api/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rateMin: parseFloat(formData.rateMin),
          rateMax: parseFloat(formData.rateMax),
          requiredSkills: JSON.stringify(skills)
        }),
      });
      setFormData({ title: "", jdText: "", requiredSkills: "", rateMin: "", rateMax: "", location: "", priority: "MEDIUM", vendorId: "" });
      setActiveTab("demand");
    } catch (err) {
      console.error("Failed to create demand", err);
    } finally {
      setLoading(false);
    }
  };

  const previewSkills = formData.requiredSkills
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const selectedVendor = vendors.find(v => v.id === formData.vendorId);

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
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">
              <IconBriefcase size={16} />
              Role Details
            </h3>

            <div className="form-row">
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

          <div className="form-section">
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

          <div className="form-section">
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
                <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v! })}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <IconBuildingStore size={16} />
              Recruiting Partner
            </h3>

            <div className="form-group">
              <Label htmlFor="vendor">Associated Recruiting Partner (Optional)</Label>
              <Select value={formData.vendorId} onValueChange={v => setFormData({ ...formData, vendorId: v === "internal" || !v ? "" : v })}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Internal Requisition (No Vendor Partner)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Requisition (No Vendor Partner)</SelectItem>
                  {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="form-actions">
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

            <div className="preview-footer">
              <div className="preview-vendor">
                <IconBuildingStore size={12} />
                {selectedVendor ? selectedVendor.name : "Internal Sourcing"}
              </div>
              <span className="preview-status">Open</span>
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

        .form-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .form-section {
          padding: 20px 24px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }

        .form-section-title svg {
          color: var(--color-primary);
        }

        #vendor {
          min-height: 42px;
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--radius);
          font-size: 13px;
          padding: 8px 12px;
          transition: all 0.2s;
        }

        #vendor:hover {
          border-color: var(--color-primary);
        }

        #vendor:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px var(--color-blue-light);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-row.three-col {
          grid-template-columns: 1fr 1fr 1fr;
        }

        @media (max-width: 640px) {
          .form-row, .form-row.three-col {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-secondary);
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

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          background: var(--color-background-secondary);
          border-top: 0.5px solid var(--color-border-tertiary);
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