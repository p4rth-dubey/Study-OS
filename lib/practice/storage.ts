/** Local storage persistence for mock test attempts, recovery, and test history.
 * Designed to ensure attempt recovery after unexpected page refresh or browser restart. */

import type { TestPaper, TestAttemptState, TestResult } from "./types";

const ACTIVE_TEST_KEY = "studyos_active_test_v1";
const ACTIVE_PAPER_KEY = "studyos_active_paper_v1";
const TEST_HISTORY_KEY = "studyos_practice_history_v1";

export function saveActiveSession(paper: TestPaper, attempt: TestAttemptState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_PAPER_KEY, JSON.stringify(paper));
    localStorage.setItem(ACTIVE_TEST_KEY, JSON.stringify(attempt));
  } catch {
    // Quota exceeded or private browsing block
  }
}

export function loadActiveSession(): { paper: TestPaper; attempt: TestAttemptState } | null {
  if (typeof window === "undefined") return null;
  try {
    const rawPaper = localStorage.getItem(ACTIVE_PAPER_KEY);
    const rawAttempt = localStorage.getItem(ACTIVE_TEST_KEY);
    if (!rawPaper || !rawAttempt) return null;
    const paper = JSON.parse(rawPaper) as TestPaper;
    const attempt = JSON.parse(rawAttempt) as TestAttemptState;
    if (!paper || !attempt || attempt.isCompleted) return null;
    return { paper, attempt };
  } catch {
    return null;
  }
}

export function updateActiveAttempt(attempt: TestAttemptState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_TEST_KEY, JSON.stringify(attempt));
  } catch {
    // Silent fail
  }
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_PAPER_KEY);
    localStorage.removeItem(ACTIVE_TEST_KEY);
  } catch {
    // Silent fail
  }
}

export function saveTestResult(result: TestResult): void {
  if (typeof window === "undefined") return;
  try {
    const history = loadTestHistory();
    // Keep max 50 recent tests to avoid bloating localStorage
    const updated = [result, ...history.filter((h) => h.testId !== result.testId)].slice(0, 50);
    localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}

export function loadTestHistory(): TestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEST_HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getTestResultById(testId: string): TestResult | null {
  const history = loadTestHistory();
  return history.find((h) => h.testId === testId) ?? null;
}
