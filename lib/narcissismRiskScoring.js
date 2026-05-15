import {
  NARCISSISM_RISK_ASSESSMENT_TYPE,
  NARCISSISM_RISK_DIMENSION_ORDER,
  NARCISSISM_RISK_FULL_SCORE,
  NARCISSISM_RISK_HIGH_RISK_QUESTION_IDS,
  NARCISSISM_RISK_QUESTION_COUNT,
  NARCISSISM_RISK_QUESTION_MAP,
  NARCISSISM_RISK_QUESTIONS,
} from "../data/narcissismRiskQuestions.js";
import { NARCISSISM_RISK_LEVELS } from "../data/narcissismRiskResultCopy.js";

const VALID_RAW_SCORES = new Set([1, 2, 3, 4, 5]);

function resolveQuestion(question) {
  if (typeof question === "string") {
    const questionConfig = NARCISSISM_RISK_QUESTION_MAP[question];
    if (!questionConfig) {
      throw new Error(`Unknown narcissism risk question id: ${question}`);
    }
    return questionConfig;
  }

  if (question && typeof question === "object" && question.question_id) {
    return question;
  }

  throw new Error("A valid narcissism risk question is required.");
}

function extractRawScore(answerValue, questionId) {
  const value =
    answerValue && typeof answerValue === "object" && !Array.isArray(answerValue)
      ? answerValue.raw_score ?? answerValue.rawScore
      : answerValue;
  const rawScore = typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (!Number.isInteger(rawScore) || !VALID_RAW_SCORES.has(rawScore)) {
    throw new Error(
      `Invalid raw score for ${questionId}. Expected an integer from 1 to 5.`
    );
  }

  return rawScore;
}

export function getNarcissismRiskActualScore(question, rawScore) {
  const questionConfig = resolveQuestion(question);
  const normalizedRawScore = extractRawScore(rawScore, questionConfig.question_id);

  return questionConfig.reverse_scored ? 6 - normalizedRawScore : normalizedRawScore;
}

export function normalizeNarcissismRiskAnswers(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new Error("Narcissism risk answers must be an object keyed by question_id.");
  }

  const normalizedAnswers = {};
  const missingQuestionIds = [];

  NARCISSISM_RISK_QUESTIONS.forEach((question) => {
    if (!Object.prototype.hasOwnProperty.call(answers, question.question_id)) {
      missingQuestionIds.push(question.question_id);
      return;
    }

    const rawScore = extractRawScore(answers[question.question_id], question.question_id);
    const score = getNarcissismRiskActualScore(question, rawScore);

    normalizedAnswers[question.question_id] = {
      raw_score: rawScore,
      score,
      dimension_code: question.dimension_code,
      reverse_scored: question.reverse_scored,
      high_risk_trigger: question.high_risk_trigger,
    };
  });

  if (missingQuestionIds.length > 0) {
    throw new Error(
      `Narcissism risk answers are incomplete. Missing ${missingQuestionIds.length} question(s): ${missingQuestionIds.join(", ")}`
    );
  }

  return normalizedAnswers;
}

export function normalizeNarcissismRiskQuestionOrder(questionOrder) {
  // Later page code should pass the randomized display order; this fallback keeps
  // pure scoring usable for tests and non-random callers.
  if (questionOrder === undefined || questionOrder === null) {
    return NARCISSISM_RISK_QUESTIONS.map((question) => question.question_id);
  }

  if (!Array.isArray(questionOrder)) {
    throw new Error("Narcissism risk questionOrder must be an array.");
  }

  const normalizedQuestionOrder = questionOrder.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") return item.question_id ?? item.id;
    return undefined;
  });

  const invalidQuestionIds = normalizedQuestionOrder.filter(
    (questionId) => !questionId || !NARCISSISM_RISK_QUESTION_MAP[questionId]
  );
  if (invalidQuestionIds.length > 0) {
    throw new Error(
      `Narcissism risk questionOrder contains unknown question id(s): ${invalidQuestionIds.join(", ")}`
    );
  }

  const uniqueQuestionIds = new Set(normalizedQuestionOrder);
  if (
    normalizedQuestionOrder.length !== NARCISSISM_RISK_QUESTION_COUNT ||
    uniqueQuestionIds.size !== NARCISSISM_RISK_QUESTION_COUNT
  ) {
    throw new Error(
      `Narcissism risk questionOrder must contain ${NARCISSISM_RISK_QUESTION_COUNT} unique question ids.`
    );
  }

  return normalizedQuestionOrder;
}

export function getNarcissismRiskResultLevel(averageScore) {
  if (!Number.isFinite(averageScore) || averageScore < 1 || averageScore > 5) {
    throw new Error("Narcissism risk averageScore must be a number from 1 to 5.");
  }

  if (averageScore <= 1.8) {
    return NARCISSISM_RISK_LEVELS.find((item) => item.level === "low");
  }
  if (averageScore <= 2.6) {
    return NARCISSISM_RISK_LEVELS.find((item) => item.level === "mild");
  }
  if (averageScore <= 3.4) {
    return NARCISSISM_RISK_LEVELS.find((item) => item.level === "moderate");
  }
  return NARCISSISM_RISK_LEVELS.find((item) => item.level === "high");
}

export function getNarcissismRiskPrimaryDimensions(dimensionScores, topCount = 2) {
  if (!dimensionScores || typeof dimensionScores !== "object") {
    throw new Error("Narcissism risk dimensionScores must be an object.");
  }

  const limit = Math.max(
    1,
    Math.min(NARCISSISM_RISK_DIMENSION_ORDER.length, Math.floor(topCount))
  );

  return NARCISSISM_RISK_DIMENSION_ORDER.map((code, index) => {
    const score = Number(dimensionScores[code]);
    if (!Number.isFinite(score)) {
      throw new Error(`Missing or invalid narcissism risk dimension score for ${code}.`);
    }

    return { code, score, index };
  })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((item) => item.code);
}

export function calculateNarcissismRiskResult(answers, questionOrder) {
  const normalizedAnswers = normalizeNarcissismRiskAnswers(answers);
  const normalizedQuestionOrder = normalizeNarcissismRiskQuestionOrder(questionOrder);

  let totalScore = 0;
  const dimensionBuckets = Object.fromEntries(
    NARCISSISM_RISK_DIMENSION_ORDER.map((code) => [
      code,
      {
        total: 0,
        count: 0,
      },
    ])
  );

  NARCISSISM_RISK_QUESTIONS.forEach((question) => {
    const answer = normalizedAnswers[question.question_id];

    if (question.included_in_total) {
      totalScore += answer.score;
    }

    if (question.included_in_dimension_avg) {
      const bucket = dimensionBuckets[question.dimension_code];
      bucket.total += answer.score;
      bucket.count += 1;
    }
  });

  const dimensionScores = Object.fromEntries(
    NARCISSISM_RISK_DIMENSION_ORDER.map((code) => {
      const bucket = dimensionBuckets[code];
      if (bucket.count !== 8) {
        throw new Error(
          `Narcissism risk dimension ${code} expected 8 scored questions, received ${bucket.count}.`
        );
      }
      return [code, bucket.total / bucket.count];
    })
  );

  const averageScore = totalScore / NARCISSISM_RISK_QUESTION_COUNT;
  const scoreRate = (totalScore / NARCISSISM_RISK_FULL_SCORE) * 100;
  const resultLevel = getNarcissismRiskResultLevel(averageScore);
  const highRiskItems = NARCISSISM_RISK_HIGH_RISK_QUESTION_IDS.filter(
    (questionId) => normalizedAnswers[questionId].raw_score >= 4
  );

  return {
    assessment_type: NARCISSISM_RISK_ASSESSMENT_TYPE,
    total_score: totalScore,
    dynamic_full_score: NARCISSISM_RISK_FULL_SCORE,
    average_score: averageScore,
    score_rate: scoreRate,
    result_level: resultLevel.level,
    result_label: resultLevel.label,
    dimension_scores: dimensionScores,
    answers: normalizedAnswers,
    high_risk_triggered: highRiskItems.length > 0,
    high_risk_items: highRiskItems,
    primary_risk_dimensions: getNarcissismRiskPrimaryDimensions(dimensionScores),
    question_order: normalizedQuestionOrder,
  };
}
