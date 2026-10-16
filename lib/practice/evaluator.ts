/** Test grading & analytics evaluator.
 * Computes exact marks based on exam marking rules (positive marks, negative marks, unattempted = 0),
 * generates topic-wise breakdowns, accuracy percentages, and solution cards. */

import type { TestPaper, TestAttemptState, TestResult, QuestionResult } from "./types";

export function evaluateTestAttempt(
  paper: TestPaper,
  attempt: TestAttemptState,
): TestResult {
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const subjectStats: Record<string, { subjectId: string; subjectName: string; score: number; maxMarks: number; correct: number; total: number }> = {};
  const topicStats: Record<string, { topicName: string; correct: number; total: number }> = {};

  const questionResults: QuestionResult[] = paper.questions.map((q) => {
    const userAns = attempt.answers[q.id];
    const isAttempted = userAns !== undefined && userAns !== "" && userAns !== null;

    let isCorrect = false;
    let marksAwarded = 0;

    if (!isAttempted) {
      unattemptedCount++;
      marksAwarded = 0;
    } else {
      if (q.type === "numerical") {
        const numUser = Number(userAns);
        const numCorrect = Number(q.correctAnswer);
        isCorrect = !isNaN(numUser) && Math.abs(numUser - numCorrect) < 0.01;
      } else if (Array.isArray(q.correctAnswer)) {
        if (Array.isArray(userAns)) {
          const sortedUser = [...userAns].sort().join(",");
          const sortedCorrect = [...q.correctAnswer].sort().join(",");
          isCorrect = sortedUser === sortedCorrect;
        }
      } else {
        isCorrect = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      }

      if (isCorrect) {
        correctCount++;
        marksAwarded = q.marks;
      } else {
        incorrectCount++;
        marksAwarded = -Math.abs(q.negativeMarks);
      }
    }

    totalScore += marksAwarded;

    // Track subject breakdown
    if (!subjectStats[q.subjectId]) {
      subjectStats[q.subjectId] = {
        subjectId: q.subjectId,
        subjectName: q.subjectName,
        score: 0,
        maxMarks: 0,
        correct: 0,
        total: 0,
      };
    }
    subjectStats[q.subjectId].score += marksAwarded;
    subjectStats[q.subjectId].maxMarks += q.marks;
    subjectStats[q.subjectId].total += 1;
    if (isCorrect) subjectStats[q.subjectId].correct += 1;

    // Track topic breakdown
    if (!topicStats[q.topicName]) {
      topicStats[q.topicName] = { topicName: q.topicName, correct: 0, total: 0 };
    }
    topicStats[q.topicName].total += 1;
    if (isCorrect) topicStats[q.topicName].correct += 1;

    return {
      questionId: q.id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      userAnswer: userAns,
      correctAnswer: q.correctAnswer,
      isCorrect,
      isAttempted,
      marksAwarded,
      maxMarks: q.marks,
      negativeMarks: q.negativeMarks,
      solutionSteps: q.solutionSteps,
      explanation: q.explanation,
      topicName: q.topicName,
      difficulty: q.difficulty,
      provenance: q.provenance,
      source: q.source,
    };
  });

  const attemptedCount = correctCount + incorrectCount;
  const accuracyPercent = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const percentage = paper.totalMarks > 0 ? Math.max(0, Math.round((totalScore / paper.totalMarks) * 100)) : 0;

  const startTime = new Date(attempt.startedAt).getTime();
  const endTime = attempt.submittedAt ? new Date(attempt.submittedAt).getTime() : Date.now();
  const timeTakenSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));

  return {
    testId: paper.id,
    examId: paper.examId,
    title: paper.title,
    totalScore: Math.round(totalScore * 100) / 100,
    maxMarks: paper.totalMarks,
    percentage,
    accuracyPercent,
    totalQuestions: paper.questions.length,
    correctCount,
    incorrectCount,
    unattemptedCount,
    timeTakenSeconds,
    completedAt: new Date().toISOString(),
    subjectBreakdown: Object.values(subjectStats).map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      score: Math.round(s.score * 100) / 100,
      maxMarks: s.maxMarks,
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    })),
    topicBreakdown: Object.values(topicStats),
    questionResults,
  };
}
