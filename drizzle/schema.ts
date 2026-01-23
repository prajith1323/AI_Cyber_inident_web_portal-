import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "analyst", "reporter"]).default("reporter").notNull(),
  department: varchar("department", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("role_idx").on(table.role),
  activeIdx: index("active_idx").on(table.isActive),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Incidents table - stores reported cyber incidents with metadata.
 */
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  assignedAnalystId: int("assignedAnalystId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  incidentType: mysqlEnum("incidentType", ["phishing", "malware", "ddos", "brute_force", "data_exfiltration", "other"]).notNull(),
  affectedSystems: text("affectedSystems"), // JSON array of system names
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "investigating", "mitigated", "resolved", "false_positive"]).default("open").notNull(),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0.00").notNull(),
  timestamp: timestamp("timestamp").notNull(), // When incident occurred
  reportedAt: timestamp("reportedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  reporterIdx: index("reporter_idx").on(table.reporterId),
  analystIdx: index("analyst_idx").on(table.assignedAnalystId),
  statusIdx: index("status_idx").on(table.status),
  severityIdx: index("severity_idx").on(table.severity),
  typeIdx: index("type_idx").on(table.incidentType),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

/**
 * AI Analysis Results - stores ML model predictions and analysis for each incident.
 */
export const aiAnalysisResults = mysqlTable("aiAnalysisResults", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incidentId").notNull().unique(),
  classificationConfidence: decimal("classificationConfidence", { precision: 5, scale: 4 }).notNull(), // 0-1
  predictedSeverity: mysqlEnum("predictedSeverity", ["low", "medium", "high", "critical"]).notNull(),
  severityConfidence: decimal("severityConfidence", { precision: 5, scale: 4 }).notNull(), // 0-1
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).notNull(), // 0-100
  threatIndicators: text("threatIndicators"), // JSON array of identified indicators
  recommendedActions: text("recommendedActions"), // JSON array of defensive recommendations
  llmAnalysis: text("llmAnalysis"), // Natural language analysis from LLM
  modelVersion: varchar("modelVersion", { length: 64 }).notNull(),
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  incidentIdx: index("incident_idx").on(table.incidentId),
}));

export type AIAnalysisResult = typeof aiAnalysisResults.$inferSelect;
export type InsertAIAnalysisResult = typeof aiAnalysisResults.$inferInsert;

/**
 * Audit Logs - comprehensive tracking of all user actions and incident lifecycle events.
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  incidentId: int("incidentId"),
  action: varchar("action", { length: 255 }).notNull(), // e.g., "incident_created", "status_changed", "analyst_assigned"
  resourceType: varchar("resourceType", { length: 64 }).notNull(), // e.g., "incident", "user", "system"
  resourceId: int("resourceId"),
  changes: text("changes"), // JSON object of before/after values
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  incidentIdx: index("incident_idx").on(table.incidentId),
  actionIdx: index("action_idx").on(table.action),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Analyst Notes - allows analysts to add notes and observations to incidents.
 */
export const analystNotes = mysqlTable("analystNotes", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incidentId").notNull(),
  analystId: int("analystId").notNull(),
  content: text("content").notNull(),
  isInternal: boolean("isInternal").default(true).notNull(), // Internal notes not visible to reporters
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  incidentIdx: index("incident_idx").on(table.incidentId),
  analystIdx: index("analyst_idx").on(table.analystId),
}));

export type AnalystNote = typeof analystNotes.$inferSelect;
export type InsertAnalystNote = typeof analystNotes.$inferInsert;

/**
 * Incident Timeline - tracks status changes and key events in incident lifecycle.
 */
export const incidentTimeline = mysqlTable("incidentTimeline", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incidentId").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(), // "created", "status_changed", "severity_updated", "analyst_assigned"
  previousValue: text("previousValue"), // JSON
  newValue: text("newValue"), // JSON
  changedBy: int("changedBy"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  incidentIdx: index("incident_idx").on(table.incidentId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
}));

export type IncidentTimeline = typeof incidentTimeline.$inferSelect;
export type InsertIncidentTimeline = typeof incidentTimeline.$inferInsert;

/**
 * System Configuration - stores ML model versions, system settings, and feature flags.
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isSecret: boolean("isSecret").default(false).notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;
