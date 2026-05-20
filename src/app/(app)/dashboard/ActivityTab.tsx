"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconTimeline,
  IconRefresh,
  IconBolt,
  IconUserPlus,
  IconBriefcase,
  IconCoin,
  IconBuilding,
  IconBell,
} from "@tabler/icons-react";

interface Activity {
  id: string;
  type: "MATCH" | "HIRE" | "DEMAND" | "CANDIDATE" | "VENDOR" | "SYSTEM";
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  MATCH: { icon: <IconBolt size={14} />, color: "#185FA5", bgColor: "var(--color-blue-light)" },
  HIRE: { icon: <IconCoin size={14} />, color: "#639922", bgColor: "var(--color-green-light)" },
  DEMAND: { icon: <IconBriefcase size={14} />, color: "#534AB7", bgColor: "var(--color-purple-light)" },
  CANDIDATE: { icon: <IconUserPlus size={14} />, color: "#EF9F27", bgColor: "var(--color-amber-light)" },
  VENDOR: { icon: <IconBuilding size={14} />, color: "#1D9E75", bgColor: "var(--color-teal-light)" },
  SYSTEM: { icon: <IconBell size={14} />, color: "#E24B4A", bgColor: "var(--color-red-light)" },
};

const TITLES = [
  "Auto-matched with demand",
  "New hire recorded",
  "Demand created",
  "New candidate added",
  "Vendor performance updated",
  "System: Batch matching completed",
  "New vendor onboarded",
  "Candidate status changed",
  "High priority demand flagged",
  "Margin forecast updated",
];

const DESCRIPTIONS = [
  "3 strong fits found (scores: 92, 87, 81)",
  "Senior Dev placed at $150/hr via TechRecruit Pro",
  "Senior Full Stack Developer with 8 required skills",
  "James Anderson with React, TypeScript, AWS experience",
  "Elite Talent Hub score improved to 4.5/5.0",
  "45 candidates matched against 12 open demands",
  "CloudStaff International registered with 12% commission",
  "Maria Garcia moved to INTERVIEWING status",
  "Frontend Developer - 12 days aging, HIGH priority",
  "Projected 12M margin: $1.2M across 18 active hires",
];

const NAMES = [
  "Alice Chen", "Bob Martinez", "Carol Singh", "David Kim", "Eva Johansson",
  "Frank O'Brien", "Grace Liu", "Henry Park", "Isabella Costa", "Jack Wilson",
];

function generateActivity(index: number): Activity {
  const types = ["MATCH", "HIRE", "DEMAND", "CANDIDATE", "VENDOR", "SYSTEM"] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  const config = ACTIVITY_ICONS[type];
  const hoursAgo = Math.random() * 72;
  const titleIdx = Math.floor(Math.random() * TITLES.length);

  return {
    id: `activity-${Date.now()}-${index}`,
    type,
    title: TITLES[titleIdx],
    description: DESCRIPTIONS[titleIdx] || TITLES[titleIdx],
    timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
  };
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function ActivityCard({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  return (
    <div className="activity-row">
      {!isLast && <div className="activity-line" />}
      <div
        className="activity-icon-wrapper"
        style={{ background: activity.bgColor, color: activity.color }}
      >
        {activity.icon}
      </div>
      <div className="activity-content">
        <div className="activity-title">{activity.title}</div>
        <div className="activity-desc">{activity.description}</div>
      </div>
      <div className="activity-time">{formatRelativeTime(activity.timestamp)}</div>
    </div>
  );
}

export default function ActivityTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateActivities = useCallback(() => {
    const generated = Array.from({ length: 15 }, (_, i) => generateActivity(i));
    generated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setActivities(generated);
  }, []);

  useEffect(() => {
    generateActivities();
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateActivity(0);
        const updated = [newActivity, ...prev].slice(0, 30);
        updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return updated;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [generateActivities]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    generateActivities();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Stats
  const activityTypes = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-title">Activity Timeline</div>
      <div className="page-sub">
        Real-time system activity feed · auto-updates every 10s
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ marginBottom: "16px" }}>
        <div className="kpi">
          <div className="kpi-label">Recent Activities</div>
          <div className="kpi-val">{activities.length}</div>
        </div>
        {Object.entries(ACTIVITY_ICONS).map(([type, config]) => (
          <div key={type} className="kpi">
            <div className="kpi-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: config.color }}>{config.icon}</span>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </div>
            <div className="kpi-val" style={{ fontSize: "18px" }}>{activityTypes[type] || 0}</div>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="card-wireframe">
        <div className="card-title-wireframe" style={{ marginBottom: "4px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IconTimeline size={15} style={{ color: "var(--color-primary)" }} /> Live Feed
          </div>
          <button
            onClick={handleRefresh}
            style={{
              background: "none",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--radius)",
              padding: "4px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10px",
              color: "var(--color-text-secondary)",
            }}
          >
            <IconRefresh
              size={12}
              style={{ animation: isRefreshing ? "spin 0.5s linear" : "none" }}
            />
            Refresh
          </button>
        </div>
        <div className="activity-feed">
          {activities.map((activity, i) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isLast={i === activities.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
