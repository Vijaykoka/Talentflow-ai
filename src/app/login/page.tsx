"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  IconBolt, 
  IconSparkles, 
  IconChartLine, 
  IconUsers, 
  IconLayoutKanban, 
  IconBriefcase,
  IconKey,
  IconBuildingStore,
} from "@tabler/icons-react";

type Role = "SUPER_ADMIN" | "EXECUTIVE" | "TA_COORDINATOR" | "HIRING_MANAGER" | "AGENCY_PARTNER" | "TA_TEAM" | "HIRING_TEAM";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("TA_TEAM");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: Role) => {
    setIsLoading(true);
    let demoEmail = "super-admin@talentflow.ai";
    if (role === "EXECUTIVE") demoEmail = "executive@talentflow.ai";
    else if (role === "TA_COORDINATOR") demoEmail = "ta-coordinator@talentflow.ai";
    else if (role === "HIRING_MANAGER") demoEmail = "hiring-manager@talentflow.ai";
    else if (role === "AGENCY_PARTNER") demoEmail = "agency-partner@talentflow.ai";
    else if (role === "TA_TEAM") demoEmail = "ta-team@talentflow.ai";
    else if (role === "HIRING_TEAM") demoEmail = "hiring-team@talentflow.ai";

    try {
      await signIn("credentials", {
        email: demoEmail,
        password: "demo123",
        role,
        redirect: false,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, hsl(210, 60%, 97%) 0%, hsl(0, 0%, 100%) 50%, hsl(246, 50%, 97%) 100%)",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
            <div className="logo-dot" style={{ width: "36px", height: "36px", borderRadius: "10px", fontSize: "16px" }}>
              <IconBolt size={18} />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>TalentFlow AI</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>End-to-End Talent Fulfillment Platform</p>
        </div>

        <div className="card-wireframe" style={{ padding: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)" }}>Welcome Back</h1>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>Sign in to access your dashboard</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Label style={{ fontSize: "12px", marginBottom: "8px", display: "block", fontWeight: 600 }}>Quick Demo Logins</Label>
            
            {/* Super Admin Full Access */}
            <button
              type="button"
              onClick={() => handleDemoLogin("SUPER_ADMIN")}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius)",
                border: selectedRole === "SUPER_ADMIN" ? "2px solid var(--color-primary)" : "1px solid var(--color-border-tertiary)",
                background: selectedRole === "SUPER_ADMIN" ? "var(--color-blue-light)" : "var(--color-background-primary)",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textAlign: "left",
                marginBottom: "8px",
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "rgba(226, 75, 74, 0.1)",
                color: "var(--color-error)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <IconKey size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)", display: "block" }}>Super Admin (Full Access)</span>
                <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", display: "block" }}>Full system configuration, margins, and control</span>
              </div>
            </button>

            {/* 2x2 Grid for other roles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                {
                  role: "EXECUTIVE" as Role,
                  label: "Executive",
                  sub: "Full Read-Only",
                  desc: "Margins & TDAF",
                  icon: IconChartLine,
                  bg: "rgba(99, 153, 34, 0.1)",
                  color: "var(--color-success-dark)"
                },
                {
                  role: "TA_COORDINATOR" as Role,
                  label: "TA Coordinator",
                  sub: "Candidate Focus",
                  desc: "Bench & Locations",
                  icon: IconUsers,
                  bg: "rgba(33, 150, 243, 0.1)",
                  color: "var(--color-primary)"
                },
                {
                  role: "HIRING_MANAGER" as Role,
                  label: "Hiring Manager",
                  sub: "Client Focus",
                  desc: "Demands & Feedback",
                  icon: IconBriefcase,
                  bg: "rgba(239, 159, 39, 0.1)",
                  color: "var(--color-warning-dark)"
                },
                {
                  role: "AGENCY_PARTNER" as Role,
                  label: "Agency Partner",
                  sub: "External Sourced",
                  desc: "Sandboxed Bench",
                  icon: IconBuildingStore,
                  bg: "rgba(156, 39, 176, 0.1)",
                  color: "var(--color-purple)"
                }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleDemoLogin(item.role)}
                  disabled={isLoading}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "var(--radius)",
                    border: selectedRole === item.role ? "2px solid var(--color-primary)" : "1px solid var(--color-border-tertiary)",
                    background: selectedRole === item.role ? "var(--color-blue-light)" : "var(--color-background-primary)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: isLoading ? 0.6 : 1,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}
                >
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: item.bg,
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "4px"
                  }}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-primary)", display: "block" }}>{item.label}</span>
                    <span style={{ fontSize: "9px", color: "var(--color-text-secondary)", display: "block", fontWeight: 500 }}>{item.sub}</span>
                    <span style={{ fontSize: "8px", color: "var(--color-text-tertiary)", display: "block" }}>{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--color-border-tertiary)" }} />
            <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "var(--color-border-tertiary)" }} />
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label style={{ fontSize: "12px" }}>Email</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label style={{ fontSize: "12px" }}>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label style={{ fontSize: "12px" }}>Role</Label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as Role)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border-tertiary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                <option value="EXECUTIVE">Executive (Read-Only)</option>
                <option value="TA_COORDINATOR">TA Coordinator (Sourcing)</option>
                <option value="HIRING_MANAGER">Hiring Manager (Department)</option>
                <option value="AGENCY_PARTNER">Agency Partner (External)</option>
              </select>
            </div>

            {error && (
              <div style={{
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                background: "var(--color-error-light)",
                color: "var(--color-error)",
                fontSize: "12px",
              }}>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
          {[
            { icon: IconSparkles, label: "AI Matching", color: "var(--color-primary)" },
            { icon: IconChartLine, label: "Margin Forecasting", color: "var(--color-success-dark)" },
            { icon: IconUsers, label: "Hot Talent", color: "var(--color-primary)" },
            { icon: IconLayoutKanban, label: "Demand Pipeline", color: "var(--color-purple)" },
          ].map((feature) => (
            <div key={feature.label} style={{
              padding: "14px",
              borderRadius: "var(--radius)",
              border: "0.5px solid var(--color-border-tertiary)",
              background: "var(--color-background-primary)",
              textAlign: "center",
              cursor: "default",
              transition: "all 0.2s",
            }}>
              <feature.icon size={22} color={feature.color} style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 500 }}>{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}