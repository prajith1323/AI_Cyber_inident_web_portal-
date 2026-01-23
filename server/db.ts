import { eq, desc, and, gte, lte, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, incidents, aiAnalysisResults, auditLogs, analystNotes, incidentTimeline, systemConfig } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "department"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.isActive, true));
}

export async function updateUserRole(userId: number, role: "admin" | "analyst" | "reporter") {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return true;
}

// ============================================================================
// INCIDENT MANAGEMENT
// ============================================================================

export async function createIncident(incident: typeof incidents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(incidents).values(incident);
  return (result as any).insertId || result[0];
}

export async function getIncidentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getIncidents(filters?: {
  status?: string;
  severity?: string;
  reporterId?: number;
  assignedAnalystId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.status) conditions.push(eq(incidents.status, filters.status as any));
  if (filters?.severity) conditions.push(eq(incidents.severity, filters.severity as any));
  if (filters?.reporterId) conditions.push(eq(incidents.reporterId, filters.reporterId));
  if (filters?.assignedAnalystId) conditions.push(eq(incidents.assignedAnalystId, filters.assignedAnalystId));
  if (filters?.startDate) conditions.push(gte(incidents.timestamp, filters.startDate));
  if (filters?.endDate) conditions.push(lte(incidents.timestamp, filters.endDate));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const baseQuery = db.select().from(incidents);
  const withWhere = whereClause ? baseQuery.where(whereClause) : baseQuery;
  const withOrder = (withWhere as any).orderBy(desc(incidents.createdAt));
  const withLimit = filters?.limit ? (withOrder as any).limit(filters.limit) : withOrder;
  const withOffset = filters?.offset ? (withLimit as any).offset(filters.offset) : withLimit;

  return await (withOffset as any);
}

export async function updateIncidentStatus(incidentId: number, status: string, changedBy: number) {
  const db = await getDb();
  if (!db) return false;

  const incident = await getIncidentById(incidentId);
  if (!incident) return false;

  await db.update(incidents).set({ status: status as any }).where(eq(incidents.id, incidentId));
  
  // Log timeline event
  await db.insert(incidentTimeline).values({
    incidentId,
    eventType: "status_changed",
    previousValue: JSON.stringify({ status: incident.status }),
    newValue: JSON.stringify({ status }),
    changedBy,
    description: `Status changed from ${incident.status} to ${status}`,
  });

  return true;
}

export async function assignIncidentToAnalyst(incidentId: number, analystId: number, assignedBy: number) {
  const db = await getDb();
  if (!db) return false;

  const incident = await getIncidentById(incidentId);
  if (!incident) return false;

  await db.update(incidents).set({ assignedAnalystId: analystId }).where(eq(incidents.id, incidentId));
  
  await db.insert(incidentTimeline).values({
    incidentId,
    eventType: "analyst_assigned",
    previousValue: JSON.stringify({ analystId: incident.assignedAnalystId }),
    newValue: JSON.stringify({ analystId }),
    changedBy: assignedBy,
    description: `Incident assigned to analyst ${analystId}`,
  });

  return true;
}

export async function updateIncidentSeverity(incidentId: number, severity: string, riskScore: number, changedBy: number) {
  const db = await getDb();
  if (!db) return false;

  const incident = await getIncidentById(incidentId);
  if (!incident) return false;

  await db.update(incidents).set({ 
    severity: severity as any,
    riskScore: riskScore.toString() as any,
  }).where(eq(incidents.id, incidentId));
  
  await db.insert(incidentTimeline).values({
    incidentId,
    eventType: "severity_updated",
    previousValue: JSON.stringify({ severity: incident.severity, riskScore: incident.riskScore }),
    newValue: JSON.stringify({ severity, riskScore }),
    changedBy,
    description: `Severity updated to ${severity} with risk score ${riskScore}`,
  });

  return true;
}

// ============================================================================
// AI ANALYSIS RESULTS
// ============================================================================

export async function createAnalysisResult(result: typeof aiAnalysisResults.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(aiAnalysisResults).values(result);
  return true;
}

export async function getAnalysisResultByIncidentId(incidentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(aiAnalysisResults).where(eq(aiAnalysisResults.incidentId, incidentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ANALYST NOTES
// ============================================================================

export async function addAnalystNote(note: typeof analystNotes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(analystNotes).values(note);
  return true;
}

export async function getAnalystNotesByIncidentId(incidentId: number, includeInternal: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(analystNotes.incidentId, incidentId)];
  if (!includeInternal) {
    conditions.push(eq(analystNotes.isInternal, false));
  }
  
  return await db.select().from(analystNotes).where(and(...conditions)).orderBy(desc(analystNotes.createdAt));
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export async function logAuditEvent(log: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log audit event: database not available");
    return;
  }
  
  try {
    await db.insert(auditLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to log audit event:", error);
  }
}

export async function getAuditLogs(filters?: {
  userId?: number;
  incidentId?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters?.incidentId) conditions.push(eq(auditLogs.incidentId, filters.incidentId));
  if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
  if (filters?.startDate) conditions.push(gte(auditLogs.createdAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(auditLogs.createdAt, filters.endDate));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const baseQuery = db.select().from(auditLogs);
  const withWhere = whereClause ? baseQuery.where(whereClause) : baseQuery;
  const withOrder = (withWhere as any).orderBy(desc(auditLogs.createdAt));
  const withLimit = filters?.limit ? (withOrder as any).limit(filters.limit) : withOrder;
  const withOffset = filters?.offset ? (withLimit as any).offset(filters.offset) : withLimit;

  return await (withOffset as any);
}

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemConfig(key: string, value: string, description?: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await getSystemConfig(key);
  
  if (existing) {
    await db.update(systemConfig).set({ value, description, updatedBy }).where(eq(systemConfig.key, key));
  } else {
    await db.insert(systemConfig).values({ key, value, description, updatedBy });
  }
  
  return true;
}
