"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconLayoutKanban,
  IconUsers,
  IconSparkles,
  IconChartLine,
  IconBuilding,
  IconBuildingStore,
  IconMap2,
  IconBolt,
  IconBell,
  IconSettings,
  IconSun,
  IconMoon,
  IconPlayerPlay,
  IconX,
  IconArrowRight,
  IconArrowLeft,
  IconBriefcase,
  IconColumns,
  IconScale,
  IconTimeline,
  IconLogout,
  IconChevronDown,
  IconFilePlus,
  IconClipboardCheck,
  IconGauge,
} from "@tabler/icons-react";
import { TabProvider, useTab, TabId } from "@/lib/context/tab-context";
import { useSession, signOut } from "next-auth/react";

const navSections = [
  {
    label: "Core",
    items: [
      { id: "tdaf" as TabId, label: "TDAF Center", icon: IconGauge },
      { id: "demand" as TabId, label: "Demand", icon: IconLayoutKanban },
      { id: "createDemand" as TabId, label: "Request Demand", icon: IconFilePlus },
      { id: "supply" as TabId, label: "Supply", icon: IconUsers },
      { id: "matching" as TabId, label: "AI Matching", icon: IconSparkles },
      { id: "projects" as TabId, label: "Projects", icon: IconBriefcase },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "margin" as TabId, label: "Margin", icon: IconChartLine },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { id: "pipeline" as TabId, label: "Kanban", icon: IconColumns },
      { id: "feedback" as TabId, label: "Interview Feedback", icon: IconClipboardCheck },
    ],
  },
  {
    label: "Analysis",
    items: [
      { id: "skillgap" as TabId, label: "Skill Gap", icon: IconScale },
      { id: "locationmatch" as TabId, label: "Location Match", icon: IconMap2 },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "client" as TabId, label: "Clients", icon: IconBuilding },
      { id: "vendor" as TabId, label: "Vendors", icon: IconBuildingStore },
      { id: "activity" as TabId, label: "Activity", icon: IconTimeline },
    ],
  },
];

function SidebarNav() {
  const { activeTab, setActiveTab } = useTab();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const getAllowedTabs = (role: string | undefined): TabId[] => {
    switch (role) {
      case "SUPER_ADMIN":
      case "TA_TEAM":
        return ["tdaf", "demand", "createDemand", "supply", "matching", "projects", "margin", "pipeline", "feedback", "skillgap", "locationmatch", "client", "vendor", "activity"];
      case "EXECUTIVE":
        return ["tdaf", "demand", "supply", "matching", "projects", "margin", "pipeline", "feedback", "skillgap", "locationmatch", "client", "vendor", "activity"];
      case "TA_COORDINATOR":
        return ["tdaf", "demand", "createDemand", "supply", "matching", "projects", "pipeline", "feedback", "skillgap", "locationmatch", "activity"];
      case "HIRING_MANAGER":
      case "HIRING_TEAM":
        return ["tdaf", "demand", "createDemand", "matching", "pipeline", "feedback", "activity"];
      case "AGENCY_PARTNER":
        return ["demand", "supply", "matching", "pipeline", "feedback"];
      default:
        return ["tdaf", "demand", "createDemand", "supply", "matching", "projects", "margin", "pipeline", "feedback", "skillgap", "locationmatch", "client", "vendor", "activity"];
    }
  };

  const allowedTabs = getAllowedTabs(userRole);

  // Auto-redirect if landing on an unauthorized tab
  useEffect(() => {
    if (userRole && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [userRole, allowedTabs, activeTab, setActiveTab]);

  const visibleNavSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => allowedTabs.includes(item.id)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <nav className="sidebar">
      {visibleNavSections.map((section) => (
        <div key={section.label}>
          <div className="nav-section">{section.label}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

/* ====== P2: Dark Mode Toggle ====== */
function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("talentflow-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("talentflow-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle };
}

/* ====== P2: Notification Bell with Live Badge ====== */
function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    fetchNotifications();
  };

  const typeIcon: Record<string, string> = {
    AUTO_MATCH: "🔄",
    HIRE: "🎉",
    WORKFLOW: "⚡",
    VENDOR: "🏢",
    SYSTEM: "🔔",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="theme-toggle"
        onClick={() => setOpen(!open)}
        style={{ position: "relative" }}
      >
        <IconBell size={17} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "36px", right: 0, width: "320px",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--radius)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 100,
          maxHeight: "400px",
          overflow: "auto",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                fontSize: "10px", color: "var(--color-primary)", background: "none",
                border: "none", cursor: "pointer", fontWeight: 500,
              }}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "12px" }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((n: any) => (
              <div key={n.id} style={{
                padding: "10px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: n.read ? "transparent" : "var(--color-blue-light)",
                cursor: "default",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>{typeIcon[n.type] || "🔔"}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>{n.title}</span>
                  <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "3px", marginLeft: "20px" }}>
                  {n.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ====== P2: Demo Walkthrough Guide ====== */
const walkthroughSteps = [
  {
    icon: "🚀",
    title: "Welcome to TalentFlow AI",
    description: "Your end-to-end AI-powered talent fulfillment platform. Let's take a quick tour of the key features.",
  },
  {
    icon: "📋",
    title: "Demand Dashboard",
    description: "View open job demands, revenue at risk, and pipeline funnel. Click 'Demand' in the sidebar to manage your hiring pipeline.",
    tab: "demand" as TabId,
  },
  {
    icon: "👥",
    title: "Supply & AI Matching",
    description: "Browse your talent pool, hot talent list, and skill breakdowns. The AI matching engine scores candidates against demands using weighted composite scoring.",
    tab: "supply" as TabId,
  },
  {
    icon: "✨",
    title: "AI Matching Engine",
    description: "Our 3-factor scoring algorithm evaluates Skill Overlap (50%), Experience Fit (30%), and Rate Compatibility (20%) to find the best matches automatically.",
    tab: "matching" as TabId,
  },
  {
    icon: "💰",
    title: "Margin Forecasting",
    description: "Track 12-month margin projections, break-even analysis, and per-hire margin cards. Every hire automatically calculates projected ROI.",
    tab: "margin" as TabId,
  },
  {
    icon: "🏢",
    title: "Vendor Management",
    description: "Performance scorecards, commission tracking, and portal access management for your recruitment partners.",
    tab: "vendor" as TabId,
  },
  {
    icon: "🌙",
    title: "Dark Mode & More",
    description: "Toggle dark mode with the moon/sun icon in the topbar. Auto-matching, workflow rules, and notifications are all running in the background. Enjoy!",
  },
];

function DemoWalkthrough({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { setActiveTab } = useTab();
  const current = walkthroughSteps[step];

  const goNext = () => {
    if (step < walkthroughSteps.length - 1) {
      const nextStep = walkthroughSteps[step + 1];
      if (nextStep.tab) setActiveTab(nextStep.tab);
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const goBack = () => {
    if (step > 0) {
      const prevStep = walkthroughSteps[step - 1];
      if (prevStep.tab) setActiveTab(prevStep.tab);
      setStep(step - 1);
    }
  };

  return (
    <div className="walkthrough-overlay" onClick={onClose}>
      <div className="walkthrough-card" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "12px", right: "12px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-text-tertiary)",
          }}
        >
          <IconX size={16} />
        </button>

        {/* Icon */}
        <div style={{ textAlign: "center", fontSize: "40px", marginBottom: "12px" }}>
          {current.icon}
        </div>

        {/* Content */}
        <h3 style={{
          textAlign: "center", fontSize: "18px", fontWeight: 600,
          color: "var(--color-text-primary)", marginBottom: "8px",
        }}>
          {current.title}
        </h3>
        <p style={{
          textAlign: "center", fontSize: "13px", lineHeight: 1.6,
          color: "var(--color-text-secondary)", marginBottom: "20px",
        }}>
          {current.description}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            className="walkthrough-btn walkthrough-btn-secondary"
            onClick={goBack}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "4px" }}
          >
            <IconArrowLeft size={14} /> Back
          </button>

          <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", fontWeight: 500 }}>
            {step + 1} / {walkthroughSteps.length}
          </span>

          <button
            className="walkthrough-btn walkthrough-btn-primary"
            onClick={goNext}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {step === walkthroughSteps.length - 1 ? "Get Started" : "Next"} <IconArrowRight size={14} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="walkthrough-step-indicator">
          {walkthroughSteps.map((_, i) => (
            <div key={i} className={`walkthrough-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  const { dark, toggle } = useTheme();
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem("talentflow-walkthrough-seen");
    if (!hasSeenWalkthrough) {
      const timer = setTimeout(() => setShowWalkthrough(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeWalkthrough = () => {
    setShowWalkthrough(false);
    localStorage.setItem("talentflow-walkthrough-seen", "true");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "TA_TEAM":
        return { label: "TA Team", color: "var(--color-primary)" };
      case "HIRING_TEAM":
        return { label: "Hiring Team", color: "var(--color-purple)" };
      default:
        return { label: role, color: "var(--color-text-secondary)" };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const user = session?.user;
  const roleInfo = user?.role ? getRoleBadge(user.role) : null;

  return (
    <>
      <header className="topbar">
        <div className="logo-pill">
          <div className="logo-dot">
            <IconBolt size={12} />
          </div>
          TalentFlow AI
        </div>
        <span className="badge-blue">Vibeathon 2026</span>
        <div className="topbar-right">
          <button
            className="theme-toggle"
            onClick={() => setShowWalkthrough(true)}
            title="Demo Walkthrough"
          >
            <IconPlayerPlay size={15} />
          </button>
          <button className="theme-toggle" onClick={toggle} title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {dark ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>
          <NotificationBell />
          <IconSettings size={17} color="var(--color-text-secondary)" />
          {user && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: showUserMenu ? "var(--color-blue-light)" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div className="avatar">{getInitials(user.name || "U")}</div>
                <IconChevronDown size={14} color="var(--color-text-secondary)" />
              </button>

              {showUserMenu && (
                <div style={{
                  position: "absolute",
                  top: "36px",
                  right: 0,
                  width: "220px",
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  zIndex: 100,
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "12px 14px",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                      {user.email}
                    </div>
                    {roleInfo && (
                      <div style={{
                        display: "inline-block",
                        marginTop: "6px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: roleInfo.color + "20",
                        color: roleInfo.color,
                        fontSize: "10px",
                        fontWeight: 600,
                      }}>
                        {roleInfo.label}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background-secondary)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <IconLogout size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {showWalkthrough && <DemoWalkthrough onClose={closeWalkthrough} />}
    </>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabProvider>
      <div className="app-shell">
        <Topbar />
        <SidebarNav />
        <main className="main-content active">
          {children}
        </main>
      </div>
    </TabProvider>
  );
}