"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBolt, IconSparkles, IconChartLine, IconUsers, IconLayoutKanban, IconUser, IconBriefcase } from "@tabler/icons-react";

type Role = "TA_TEAM" | "HIRING_TEAM";

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
    const demoEmail = role === "TA_TEAM" ? "ta-team@talentflow.ai" : "hiring-team@talentflow.ai";

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

          <div style={{ marginBottom: "16px" }}>
            <Label style={{ fontSize: "12px", marginBottom: "8px", display: "block" }}>Quick Demo Login</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("TA_TEAM")}
                disabled={isLoading}
                style={{
                  padding: "12px 8px",
                  borderRadius: "var(--radius)",
                  border: selectedRole === "TA_TEAM" ? "2px solid var(--color-primary)" : "1px solid var(--color-border-tertiary)",
                  background: selectedRole === "TA_TEAM" ? "var(--color-blue-light)" : "var(--color-background-primary)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <IconUser size={18} style={{ margin: "0 auto 4px", display: "block", color: "var(--color-primary)" }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", display: "block" }}>TA Team</span>
                <span style={{ fontSize: "9px", color: "var(--color-text-secondary)" }}>Talent Acquisition</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("HIRING_TEAM")}
                disabled={isLoading}
                style={{
                  padding: "12px 8px",
                  borderRadius: "var(--radius)",
                  border: selectedRole === "HIRING_TEAM" ? "2px solid var(--color-primary)" : "1px solid var(--color-border-tertiary)",
                  background: selectedRole === "HIRING_TEAM" ? "var(--color-blue-light)" : "var(--color-background-primary)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <IconBriefcase size={18} style={{ margin: "0 auto 4px", display: "block", color: "var(--color-primary)" }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", display: "block" }}>Hiring Team</span>
                <span style={{ fontSize: "9px", color: "var(--color-text-secondary)" }}>Department</span>
              </button>
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
                <option value="TA_TEAM">TA Team (Talent Acquisition)</option>
                <option value="HIRING_TEAM">Hiring Team (Department)</option>
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