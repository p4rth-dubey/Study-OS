/** Developer Types & Contracts for StudyOS God Mode.
 * Strictly typed interfaces for system stats, feature flags, audit logging,
 * sandbox simulation, and terminal commands. */

export type DeveloperRole = "FOUNDER" | "CORE_ENGINEER" | "SYSTEM_ADMIN";

export interface DeveloperSession {
  authorized: boolean;
  role?: DeveloperRole;
  developerId?: string;
  email?: string | null;
  name?: string | null;
  method: "supabase_session" | "master_key" | "local_dev";
  timestamp: string;
}

export interface SystemMetrics {
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  environment: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  database: {
    connected: boolean;
    provider: "supabase" | "local_storage";
    url: string | null;
    status: "healthy" | "degraded" | "disconnected" | "local_only";
    latencyMs: number | null;
  };
  apiHealth: {
    practiceGenerate: "online" | "degraded" | "offline";
    practiceSubmit: "online" | "degraded" | "offline";
    authService: "online" | "degraded" | "offline";
  };
  contentIndex: {
    totalExams: number;
    totalSubjects: number;
    totalQuestionsInBank: number;
    activeModulesCount: number;
  };
  activeUsersEstimate: number;
}

export type FeatureFlagKey =
  | "AI_QUESTION_GEN"
  | "CBT_MOCK_ENGINE"
  | "TEACHER_PORTAL"
  | "PARENT_REPORTS"
  | "ADVANCED_ANALYTICS"
  | "EXPERIMENTAL_AI"
  | "COMPETITIVE_EXAMS"
  | "SCHOLARSHIP_SEARCH"
  | "AUDIO_RECITATION"
  | "DEV_XRAY_OVERLAY";

export interface FeatureFlag {
  key: FeatureFlagKey;
  label: string;
  description: string;
  enabled: boolean;
  category: "core" | "ai" | "institution" | "experimental";
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  status: "success" | "denied" | "failure";
  metadata?: Record<string, unknown>;
}

export type RealityPersona =
  | "founder"
  | "student_cbse10"
  | "student_jee"
  | "student_neet"
  | "student_upsc"
  | "teacher"
  | "parent"
  | "school_admin"
  | "free_tier"
  | "pro_tier";

export interface RealityState {
  activePersona: RealityPersona;
  effectiveGrade: number;
  effectiveTargetExam: string;
  simulatedSubscription: "free" | "pro" | "founder";
  simulatedRole: "student" | "teacher" | "parent" | "admin";
}

export interface SandboxData {
  classroomsCount: number;
  mockStudentsCount: number;
  assignmentsCount: number;
  sampleTestsCount: number;
  lastGeneratedAt: string | null;
}

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  allowedRoles: string[];
  updatedAt: string;
  updatedBy: string;
}
