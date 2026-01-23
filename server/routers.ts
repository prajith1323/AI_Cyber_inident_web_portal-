import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { execSync } from "child_process";
import path from "path";

// ============================================================================
// ROLE-BASED PROCEDURES
// ============================================================================

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const analystProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "analyst" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Analyst access required" });
  }
  return next({ ctx });
});

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const IncidentSubmissionSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  incidentType: z.enum(["phishing", "malware", "ddos", "brute_force", "data_exfiltration", "other"]),
  affectedSystems: z.array(z.string()).optional(),
  timestamp: z.date(),
});

const IncidentUpdateSchema = z.object({
  incidentId: z.number(),
  status: z.enum(["open", "investigating", "mitigated", "resolved", "false_positive"]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignedAnalystId: z.number().optional(),
});

const AnalystNoteSchema = z.object({
  incidentId: z.number(),
  content: z.string().min(1),
  isInternal: z.boolean().default(true),
});

// ============================================================================
// INCIDENT ROUTERS
// ============================================================================

const incidentRouter = router({
  // Submit new incident (Reporter, Analyst, Admin)
  submit: protectedProcedure
    .input(IncidentSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Create incident
        const affectedSystemsJson = input.affectedSystems ? JSON.stringify(input.affectedSystems) : null;
        
        const result = await db.createIncident({
          reporterId: ctx.user.id,
          title: input.title,
          description: input.description,
          incidentType: input.incidentType,
          affectedSystems: affectedSystemsJson,
          timestamp: input.timestamp,
          severity: "medium", // Default severity, will be updated by AI
          status: "open",
        });

        // Log audit event
        await db.logAuditEvent({
          userId: ctx.user.id,
          incidentId: result,
          action: "incident_created",
          resourceType: "incident",
          resourceId: result,
          changes: JSON.stringify({ created: true }),
        });

        // Trigger AI analysis asynchronously
        analyzeIncidentAsync(result, input.description, input.affectedSystems);

        return {
          success: true,
          incidentId: result,
          message: "Incident submitted successfully. AI analysis in progress.",
        };
      } catch (error) {
        console.error("Error submitting incident:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit incident",
        });
      }
    }),

  // Get incident by ID
  getById: protectedProcedure
    .input(z.object({ incidentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const incident = await db.getIncidentById(input.incidentId);
      
      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      // Check access: Reporter can only see their own, Analyst/Admin can see all
      if (ctx.user.role === "reporter" && incident.reporterId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Get analysis results
      const analysis = await db.getAnalysisResultByIncidentId(input.incidentId);
      
      // Get analyst notes (internal notes only visible to analysts/admins)
      const includeInternal = ctx.user.role !== "reporter";
      const notes = await db.getAnalystNotesByIncidentId(input.incidentId, includeInternal);

      return {
        incident,
        analysis,
        notes,
      };
    }),

  // List incidents with filtering
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        severity: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {
        status: input.status,
        severity: input.severity,
        limit: input.limit,
        offset: input.offset,
      };

      // Reporters only see their own incidents
      if (ctx.user.role === "reporter") {
        filters.reporterId = ctx.user.id;
      }

      const incidents = await db.getIncidents(filters);
      return incidents;
    }),

  // Update incident status (Analyst, Admin)
  updateStatus: analystProcedure
    .input(
      z.object({
        incidentId: z.number(),
        status: z.enum(["open", "investigating", "mitigated", "resolved", "false_positive"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const incident = await db.getIncidentById(input.incidentId);
      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      await db.updateIncidentStatus(input.incidentId, input.status, ctx.user.id);

      await db.logAuditEvent({
        userId: ctx.user.id,
        incidentId: input.incidentId,
        action: "status_changed",
        resourceType: "incident",
        resourceId: input.incidentId,
        changes: JSON.stringify({ from: incident.status, to: input.status }),
      });

      return { success: true };
    }),

  // Assign incident to analyst (Admin)
  assignAnalyst: adminProcedure
    .input(
      z.object({
        incidentId: z.number(),
        analystId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const incident = await db.getIncidentById(input.incidentId);
      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      const analyst = await db.getUserById(input.analystId);
      if (!analyst || analyst.role !== "analyst") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid analyst ID" });
      }

      await db.assignIncidentToAnalyst(input.incidentId, input.analystId, ctx.user.id);

      await db.logAuditEvent({
        userId: ctx.user.id,
        incidentId: input.incidentId,
        action: "analyst_assigned",
        resourceType: "incident",
        resourceId: input.incidentId,
        changes: JSON.stringify({ analystId: input.analystId }),
      });

      return { success: true };
    }),

  // Get analytics data
  getAnalytics: analystProcedure.query(async ({ ctx }) => {
    const incidents = await db.getIncidents({ limit: 1000 });

    const stats = {
      total: incidents.length,
      bySeverity: {
        critical: incidents.filter((i: any) => i.severity === "critical").length,
        high: incidents.filter((i: any) => i.severity === "high").length,
        medium: incidents.filter((i: any) => i.severity === "medium").length,
        low: incidents.filter((i: any) => i.severity === "low").length,
      },
      byStatus: {
        open: incidents.filter((i: any) => i.status === "open").length,
        investigating: incidents.filter((i: any) => i.status === "investigating").length,
        mitigated: incidents.filter((i: any) => i.status === "mitigated").length,
        resolved: incidents.filter((i: any) => i.status === "resolved").length,
        false_positive: incidents.filter((i: any) => i.status === "false_positive").length,
      },
      byType: {
        phishing: incidents.filter((i: any) => i.incidentType === "phishing").length,
        malware: incidents.filter((i: any) => i.incidentType === "malware").length,
        ddos: incidents.filter((i: any) => i.incidentType === "ddos").length,
        brute_force: incidents.filter((i: any) => i.incidentType === "brute_force").length,
        data_exfiltration: incidents.filter((i: any) => i.incidentType === "data_exfiltration").length,
        other: incidents.filter((i: any) => i.incidentType === "other").length,
      },
      avgRiskScore: incidents.length > 0
        ? incidents.reduce((sum: number, i: any) => sum + parseFloat(i.riskScore.toString()), 0) / incidents.length
        : 0,
    };

    return stats;
  }),
});

// ============================================================================
// ANALYST NOTES ROUTERS
// ============================================================================

const notesRouter = router({
  // Add analyst note
  add: analystProcedure
    .input(AnalystNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const incident = await db.getIncidentById(input.incidentId);
      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      await db.addAnalystNote({
        incidentId: input.incidentId,
        analystId: ctx.user.id,
        content: input.content,
        isInternal: input.isInternal,
      });

      await db.logAuditEvent({
        userId: ctx.user.id,
        incidentId: input.incidentId,
        action: "note_added",
        resourceType: "incident",
        resourceId: input.incidentId,
        changes: JSON.stringify({ noteAdded: true }),
      });

      return { success: true };
    }),

  // Get notes for incident
  getByIncident: analystProcedure
    .input(z.object({ incidentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const incident = await db.getIncidentById(input.incidentId);
      if (!incident) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Incident not found" });
      }

      const includeInternal = ctx.user.role !== "reporter";
      return await db.getAnalystNotesByIncidentId(input.incidentId, includeInternal);
    }),
});

// ============================================================================
// USER MANAGEMENT ROUTERS (Admin only)
// ============================================================================

const userRouter = router({
  // List all users
  list: adminProcedure.query(async () => {
    return await db.getAllUsers();
  }),

  // Update user role
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "analyst", "reporter"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await db.updateUserRole(input.userId, input.role);

      await db.logAuditEvent({
        userId: ctx.user.id,
        action: "user_role_updated",
        resourceType: "user",
        resourceId: input.userId,
        changes: JSON.stringify({ role: input.role }),
      });

      return { success: true };
    }),

  // Get current user
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});

// ============================================================================
// AUDIT LOG ROUTERS (Admin, Analyst)
// ============================================================================

const auditRouter = router({
  // Get audit logs
  list: analystProcedure
    .input(
      z.object({
        incidentId: z.number().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.getAuditLogs({
        incidentId: input.incidentId,
        limit: input.limit,
        offset: input.offset,
      });
    }),
});

// ============================================================================
// AI ANALYSIS HELPER (Internal)
// ============================================================================

async function analyzeIncidentAsync(incidentId: number, description: string, affectedSystems?: string[]) {
  try {
    // Call Python ML prediction service
    const mlInput = JSON.stringify({
      action: "analyze",
      incident: {
        description,
        affected_systems: affectedSystems || [],
      },
    });

    const mlScript = path.join(process.cwd(), "ml", "predict.py");
    const escapedInput = mlInput.replace(/\\/g, "\\\\").replace(/'/g, "'\\''")
    const result = execSync(`python3 "${mlScript}" '${escapedInput}'`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });

    const mlResult = JSON.parse(result);

    if (!mlResult.success) {
      console.error("ML analysis failed:", mlResult.error);
      return;
    }

    const analysis = mlResult.result;

    // Generate LLM-powered insights
    const llmAnalysis = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity expert. Analyze the incident and provide detailed insights about the threat, potential impact, and recommended response actions. Be concise but thorough.",
        },
        {
          role: "user",
          content: `Incident Type: ${analysis.incident_type}\nSeverity: ${analysis.severity}\nRisk Score: ${analysis.risk_score}/100\nDescription: ${description}\n\nProvide a brief analysis of this incident including potential impact and recommended immediate actions.`,
        },
      ],
    });

    const llmContent = typeof llmAnalysis.choices?.[0]?.message?.content === "string" 
      ? llmAnalysis.choices[0].message.content 
      : "";

    // Store analysis results
    await db.createAnalysisResult({
      incidentId,
      classificationConfidence: analysis.type_confidence,
      predictedSeverity: analysis.severity,
      severityConfidence: analysis.severity_confidence,
      riskScore: analysis.risk_score,
      threatIndicators: JSON.stringify(analysis.threat_indicators),
      recommendedActions: JSON.stringify(analysis.recommendations),
      llmAnalysis: llmContent || "",
      modelVersion: "1.0.0",
    });

    // Update incident with AI-predicted severity and risk score
    const incident = await db.getIncidentById(incidentId);
    if (incident) {
      await db.updateIncidentSeverity(incidentId, analysis.severity, analysis.risk_score, 0);
    }

    console.log(`[+] AI analysis completed for incident ${incidentId}`);
  } catch (error) {
    console.error(`[-] AI analysis failed for incident ${incidentId}:`, error);
  }
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  incident: incidentRouter,
  notes: notesRouter,
  user: userRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
