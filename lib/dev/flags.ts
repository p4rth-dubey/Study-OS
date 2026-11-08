/** Server-Side Feature Flag Controller for StudyOS God Mode.
 * Persistent in-memory flag registry with server-side controls. */

import type { FeatureFlag, FeatureFlagKey } from "./types";
import { recordAuditLog } from "./audit";

declare global {
  // eslint-disable-next-line no-var
  var __studyos_feature_flags__: Record<FeatureFlagKey, FeatureFlag> | undefined;
}

const DEFAULT_FLAGS: Record<FeatureFlagKey, FeatureFlag> = {
  AI_QUESTION_GEN: {
    key: "AI_QUESTION_GEN",
    label: "AI Question Generator",
    description: "Generates authentic board & entrance test questions with step-by-step solutions.",
    enabled: true,
    category: "ai",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  CBT_MOCK_ENGINE: {
    key: "CBT_MOCK_ENGINE",
    label: "CBT Mock Test Engine",
    description: "Timed computer-based test interface with question palette, autosave, and scoring.",
    enabled: true,
    category: "core",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  TEACHER_PORTAL: {
    key: "TEACHER_PORTAL",
    label: "Teacher Classroom Portal",
    description: "Teacher tools to distribute batch assignments and inspect syllabus completion.",
    enabled: true,
    category: "institution",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  PARENT_REPORTS: {
    key: "PARENT_REPORTS",
    label: "Parent Weekly Progress Reports",
    description: "Weekly revision summary, streak alerts, and mock score digests for parents.",
    enabled: true,
    category: "institution",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  ADVANCED_ANALYTICS: {
    key: "ADVANCED_ANALYTICS",
    label: "Deep Insights & Predictive Pace",
    description: "Statistical pace calculation, syllabus bottleneck warnings, and radar charts.",
    enabled: true,
    category: "core",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  EXPERIMENTAL_AI: {
    key: "EXPERIMENTAL_AI",
    label: "Experimental AI Audio & Reasoning",
    description: "Early access to voice problem breakdowns and multimodal diagram reasoning.",
    enabled: false,
    category: "experimental",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  COMPETITIVE_EXAMS: {
    key: "COMPETITIVE_EXAMS",
    label: "Competitive Entrance Portals (JEE/NEET/UPSC)",
    description: "National examination registries, marking schemes, and stage gates.",
    enabled: true,
    category: "core",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  SCHOLARSHIP_SEARCH: {
    key: "SCHOLARSHIP_SEARCH",
    label: "National Scholarship Directory",
    description: "Verified central and state government scholarship eligibility explorer.",
    enabled: true,
    category: "core",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  AUDIO_RECITATION: {
    key: "AUDIO_RECITATION",
    label: "Audio Lecture Recitation",
    description: "Text-to-speech audio recitations for chapter concepts and formulas.",
    enabled: false,
    category: "experimental",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
  DEV_XRAY_OVERLAY: {
    key: "DEV_XRAY_OVERLAY",
    label: "Developer X-Ray Vision HUD",
    description: "Renders real-time component hierarchy, API latencies, and state inspectors.",
    enabled: true,
    category: "experimental",
    updatedAt: new Date().toISOString(),
    updatedBy: "system_default",
  },
};

if (!globalThis.__studyos_feature_flags__) {
  globalThis.__studyos_feature_flags__ = { ...DEFAULT_FLAGS };
}

export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(globalThis.__studyos_feature_flags__!);
}

export function getFeatureFlag(key: FeatureFlagKey): boolean {
  return globalThis.__studyos_feature_flags__?.[key]?.enabled ?? false;
}

export function updateFeatureFlag(
  key: FeatureFlagKey,
  enabled: boolean,
  actor: string
): FeatureFlag {
  const flags = globalThis.__studyos_feature_flags__!;
  const existing = flags[key] || DEFAULT_FLAGS[key];

  const updated: FeatureFlag = {
    ...existing,
    enabled,
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  };

  flags[key] = updated;

  recordAuditLog(
    actor,
    "FOUNDER",
    enabled ? "FEATURE_FLAG_ENABLED" : "FEATURE_FLAG_DISABLED",
    `feature_flag:${key}`,
    "success",
    { flag: key, newState: enabled }
  );

  return updated;
}
