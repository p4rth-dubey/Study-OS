/** Unit & Integration Tests for StudyOS Multi-Exam & Practice Engine.
 * Run with: node tests/unit-exams-practice.mjs */

import assert from "node:assert";
import { EXAM_REGISTRY, getAllExams, getExamById } from "../lib/exams/registry.ts";
import { VERIFIED_QUESTION_BANK, getQuestionsByFilter } from "../lib/practice/question-bank.ts";
import { evaluateTestAttempt } from "../lib/practice/evaluator.ts";
import { OFFICIAL_UPDATES } from "../lib/updates/registry.ts";
import { SCHOLARSHIPS_REGISTRY } from "../lib/scholarships/registry.ts";

console.log("=== Running StudyOS Core Platform Tests ===\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    failed++;
  }
}

// 1. Exam Registry Tests
test("Exam Registry contains all required 12 exams", () => {
  const exams = getAllExams();
  assert(exams.length >= 10, `Expected at least 10 exams, found ${exams.length}`);
  const expectedIds = ["cbse-9", "cbse-10", "cbse-12", "jee-main", "jee-advanced", "neet-ug", "upsc-cse", "ssc-cgl", "banking-po", "cuet", "gate"];
  for (const id of expectedIds) {
    const ex = getExamById(id);
    assert(ex !== null, `Exam ${id} missing from registry`);
    assert(ex.subjects.length > 0, `Exam ${id} must have subjects`);
    assert(ex.officialUrl.startsWith("http"), `Exam ${id} must have official URL`);
    assert(ex.isVerified, `Exam ${id} must be verified`);
  }
});

// 2. Question Bank Validation
test("Question bank questions have valid schema and authentic provenance", () => {
  assert(VERIFIED_QUESTION_BANK.length >= 10, "Question bank should have verified questions");
  for (const q of VERIFIED_QUESTION_BANK) {
    assert(q.id, "Question must have unique ID");
    assert(q.questionText.length > 10, "Question text must not be empty");
    assert(q.marks > 0, "Question marks must be positive");
    assert(q.solutionSteps.length > 0, "Question must have step-by-step solution");
    assert(q.explanation.length > 5, "Question must have explanation");
    assert(q.isVerified, "Question must be verified");
    assert(["verified_pyq", "official_sample", "ai_curated"].includes(q.provenance), "Valid provenance required");
    if (q.type === "mcq_single" || q.type === "assertion_reason") {
      assert(q.options && q.options.length >= 2, `MCQ ${q.id} must have at least 2 options`);
    }
  }
});

// 3. Evaluator & Scoring Tests (JEE Main marking scheme: +4 / -1)
test("Evaluator accurately calculates JEE Main scores with negative marking", () => {
  const mockPaper = {
    id: "test_jee_test",
    examId: "jee-main",
    title: "JEE Mock",
    category: "engineering",
    durationMinutes: 180,
    totalMarks: 16,
    questions: [
      {
        id: "q1",
        examId: "jee-main",
        subjectId: "physics",
        subjectName: "Physics",
        topicId: "kinematics",
        topicName: "Kinematics",
        questionText: "Sample Physics Q1",
        type: "mcq_single",
        correctAnswer: "B",
        solutionSteps: ["Step 1"],
        explanation: "Exp 1",
        difficulty: "medium",
        marks: 4,
        negativeMarks: 1,
        source: "JEE Main",
        isPyq: true,
        isVerified: true,
        provenance: "verified_pyq",
        tags: [],
      },
      {
        id: "q2",
        examId: "jee-main",
        subjectId: "physics",
        subjectName: "Physics",
        topicId: "kinematics",
        topicName: "Kinematics",
        questionText: "Sample Physics Q2",
        type: "mcq_single",
        correctAnswer: "A",
        solutionSteps: ["Step 1"],
        explanation: "Exp 2",
        difficulty: "medium",
        marks: 4,
        negativeMarks: 1,
        source: "JEE Main",
        isPyq: true,
        isVerified: true,
        provenance: "verified_pyq",
        tags: [],
      },
      {
        id: "q3",
        examId: "jee-main",
        subjectId: "maths",
        subjectName: "Mathematics",
        topicId: "calculus",
        topicName: "Calculus",
        questionText: "Sample Numerical Q3",
        type: "numerical",
        correctAnswer: 8,
        solutionSteps: ["Step 1"],
        explanation: "Exp 3",
        difficulty: "hard",
        marks: 4,
        negativeMarks: 1,
        source: "JEE Main",
        isPyq: true,
        isVerified: true,
        provenance: "verified_pyq",
        tags: [],
      },
      {
        id: "q4",
        examId: "jee-main",
        subjectId: "maths",
        subjectName: "Mathematics",
        topicId: "calculus",
        topicName: "Calculus",
        questionText: "Sample Q4 Unattempted",
        type: "mcq_single",
        correctAnswer: "C",
        solutionSteps: ["Step 1"],
        explanation: "Exp 4",
        difficulty: "easy",
        marks: 4,
        negativeMarks: 1,
        source: "JEE Main",
        isPyq: true,
        isVerified: true,
        provenance: "verified_pyq",
        tags: [],
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const mockAttempt = {
    testId: mockPaper.id,
    examId: mockPaper.examId,
    title: mockPaper.title,
    totalQuestions: 4,
    totalMarks: 16,
    durationMinutes: 180,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    submittedAt: new Date().toISOString(),
    answers: {
      q1: "B", // Correct (+4)
      q2: "C", // Incorrect (-1)
      q3: "8", // Correct numerical (+4)
      // q4 unattempted (0)
    },
    visited: { q1: true, q2: true, q3: true, q4: true },
    markedForReview: {},
    timeRemainingSeconds: 7200,
    isCompleted: true,
  };

  const result = evaluateTestAttempt(mockPaper, mockAttempt);

  // Expected score: +4 - 1 + 4 + 0 = 7
  assert.strictEqual(result.totalScore, 7, `Expected total score 7, got ${result.totalScore}`);
  assert.strictEqual(result.correctCount, 2, `Expected 2 correct, got ${result.correctCount}`);
  assert.strictEqual(result.incorrectCount, 1, `Expected 1 incorrect, got ${result.incorrectCount}`);
  assert.strictEqual(result.unattemptedCount, 1, `Expected 1 unattempted, got ${result.unattemptedCount}`);
  // Accuracy: 2 / (2 + 1) = 67%
  assert.strictEqual(result.accuracyPercent, 67, `Expected accuracy 67%, got ${result.accuracyPercent}`);
  assert.strictEqual(result.subjectBreakdown.length, 2, "Expected 2 subjects");
});

// 4. Official Updates Verification
test("Official education updates have valid authorities and verified URLs", () => {
  assert(OFFICIAL_UPDATES.length >= 6, "Expected at least 6 official updates");
  for (const upd of OFFICIAL_UPDATES) {
    assert(upd.officialSourceUrl.startsWith("http"), `Update ${upd.id} must link to official source`);
    assert(upd.conductingAuthority.length > 2, `Update ${upd.id} must declare authority`);
    assert(upd.isVerified, `Update ${upd.id} must be verified`);
  }
});

// 5. Scholarship Registry Verification
test("Scholarship directory contains verified national schemes", () => {
  assert(SCHOLARSHIPS_REGISTRY.length >= 5, "Expected at least 5 scholarships");
  for (const sch of SCHOLARSHIPS_REGISTRY) {
    assert(sch.benefitAmount.length > 2, `Scholarship ${sch.id} must state benefit`);
    assert(sch.officialUrl.startsWith("http"), `Scholarship ${sch.id} must have official portal link`);
    assert(sch.eligibilityCriteria.length > 0, `Scholarship ${sch.id} must specify eligibility`);
    assert(sch.isVerified, `Scholarship ${sch.id} must be verified`);
  }
});

console.log(`\n==== Test Results: ${passed} passed, ${failed} failed ====`);
if (failed > 0) process.exit(1);
