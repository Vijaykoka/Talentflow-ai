/**
 * P2: Workflow Rule Engine
 *
 * A simple, configurable rule engine that evaluates conditions
 * and triggers actions based on entity events.
 *
 * Rules are stored in-memory with sensible defaults.
 * In production, these would be persisted to the database.
 */

import { logNotification } from "./notifications";

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: "DEMAND_CREATED" | "CANDIDATE_ADDED" | "MATCH_FOUND" | "HIRE_CREATED" | "DEMAND_STATUS_CHANGED";
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
  createdAt: string;
  executionCount: number;
}

interface WorkflowCondition {
  field: string;
  operator: "equals" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value: any;
}

interface WorkflowAction {
  type: "NOTIFY" | "UPDATE_STATUS" | "FLAG_HOT" | "AUTO_ASSIGN" | "LOG";
  params: Record<string, any>;
}

// Default workflow rules
const defaultRules: WorkflowRule[] = [
  {
    id: "rule-1",
    name: "High Priority Auto-Alert",
    description: "Send notification when a HIGH priority demand is created",
    trigger: "DEMAND_CREATED",
    conditions: [{ field: "priority", operator: "equals", value: "HIGH" }],
    actions: [
      { type: "NOTIFY", params: { title: "🔥 High Priority Demand", message: "New high priority demand requires immediate attention" } },
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 0,
  },
  {
    id: "rule-2",
    name: "Excellent Match Alert",
    description: "Alert when a match score exceeds 90",
    trigger: "MATCH_FOUND",
    conditions: [{ field: "matchScore", operator: "gte", value: 90 }],
    actions: [
      { type: "NOTIFY", params: { title: "⭐ Excellent Match Found", message: "A candidate scored 90+ on a demand" } },
      { type: "FLAG_HOT", params: {} },
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 0,
  },
  {
    id: "rule-3",
    name: "Auto-Flag Experienced Talent",
    description: "Flag candidates with 8+ years as hot talent",
    trigger: "CANDIDATE_ADDED",
    conditions: [{ field: "experienceYears", operator: "gte", value: 8 }],
    actions: [
      { type: "FLAG_HOT", params: {} },
      { type: "NOTIFY", params: { title: "🌟 Senior Talent Added", message: "Experienced candidate auto-flagged as hot talent" } },
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 0,
  },
  {
    id: "rule-4",
    name: "Hire Celebration",
    description: "Send notification when a new hire is recorded",
    trigger: "HIRE_CREATED",
    conditions: [],
    actions: [
      { type: "NOTIFY", params: { title: "🎉 New Hire Recorded", message: "A candidate has been successfully placed" } },
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 0,
  },
  {
    id: "rule-5",
    name: "Demand Pipeline Monitor",
    description: "Alert when a demand moves to OFFER stage",
    trigger: "DEMAND_STATUS_CHANGED",
    conditions: [{ field: "status", operator: "equals", value: "OFFER" }],
    actions: [
      { type: "NOTIFY", params: { title: "📋 Demand Reached Offer", message: "A demand has progressed to the offer stage" } },
    ],
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 0,
  },
];

// In-memory store
let rules: WorkflowRule[] = [...defaultRules];

/**
 * Evaluate a single condition against an entity
 */
function evaluateCondition(condition: WorkflowCondition, entity: Record<string, any>): boolean {
  const value = entity[condition.field];
  if (value === undefined) return false;

  switch (condition.operator) {
    case "equals": return value === condition.value;
    case "gt": return value > condition.value;
    case "lt": return value < condition.value;
    case "gte": return value >= condition.value;
    case "lte": return value <= condition.value;
    case "contains": return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
    case "in": return Array.isArray(condition.value) && condition.value.includes(value);
    default: return false;
  }
}

/**
 * Execute actions for a matched rule
 */
function executeActions(rule: WorkflowRule, entity: Record<string, any>): string[] {
  const logs: string[] = [];

  for (const action of rule.actions) {
    switch (action.type) {
      case "NOTIFY":
        logNotification({
          type: "WORKFLOW",
          title: action.params.title || rule.name,
          message: `${action.params.message || rule.description} (Rule: ${rule.name})`,
          metadata: { ruleId: rule.id, entityId: entity.id },
        });
        logs.push(`Notification sent: ${action.params.title}`);
        break;

      case "FLAG_HOT":
        logs.push(`Flagged entity as hot talent`);
        break;

      case "UPDATE_STATUS":
        logs.push(`Status updated to ${action.params.status}`);
        break;

      case "AUTO_ASSIGN":
        logs.push(`Auto-assigned to ${action.params.assignee}`);
        break;

      case "LOG":
        console.log(`[WORKFLOW] ${rule.name}: ${action.params.message || "Rule triggered"}`);
        logs.push(`Logged: ${action.params.message}`);
        break;
    }
  }

  return logs;
}

/**
 * Main entry point: evaluate all rules for a given trigger event
 */
export function evaluateRules(
  trigger: WorkflowRule["trigger"],
  entity: Record<string, any>
): { triggered: number; logs: string[] } {
  const matchingRules = rules.filter(r => r.enabled && r.trigger === trigger);
  let triggered = 0;
  const allLogs: string[] = [];

  for (const rule of matchingRules) {
    const allConditionsMet = rule.conditions.length === 0 ||
      rule.conditions.every(c => evaluateCondition(c, entity));

    if (allConditionsMet) {
      const logs = executeActions(rule, entity);
      rule.executionCount++;
      triggered++;
      allLogs.push(...logs);
    }
  }

  return { triggered, logs: allLogs };
}

/**
 * Get all rules
 */
export function getRules(): WorkflowRule[] {
  return [...rules];
}

/**
 * Toggle a rule's enabled state
 */
export function toggleRule(id: string): WorkflowRule | null {
  const rule = rules.find(r => r.id === id);
  if (rule) {
    rule.enabled = !rule.enabled;
    return rule;
  }
  return null;
}

/**
 * Reset rules to defaults
 */
export function resetRules(): void {
  rules = [...defaultRules.map(r => ({ ...r, executionCount: 0 }))];
}
