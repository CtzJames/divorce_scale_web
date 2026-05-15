import {
  NARCISSISM_RISK_ASSESSMENT_TYPE,
  NARCISSISM_RISK_FULL_SCORE,
} from "../data/narcissismRiskQuestions.js";
import {
  calculateNarcissismRiskResult,
  getNarcissismRiskPrimaryDimensions,
  normalizeNarcissismRiskAnswers,
  normalizeNarcissismRiskQuestionOrder,
} from "./narcissismRiskScoring.js";

function cleanContactValue(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function resolveContact(contact = {}) {
  return {
    contact_name: cleanContactValue(contact.contact_name ?? contact.name),
    contact_phone: cleanContactValue(contact.contact_phone ?? contact.phone),
    contact_wechat: cleanContactValue(contact.contact_wechat ?? contact.wechat),
  };
}

function resolveScoringResult({ scoringResult, answers, questionOrder }) {
  if (scoringResult) return scoringResult;

  if (!answers) {
    throw new Error(
      "buildNarcissismRiskSubmissionPayload requires scoringResult or answers."
    );
  }

  return calculateNarcissismRiskResult(answers, questionOrder);
}

export function buildNarcissismRiskSubmissionPayload({
  scoringResult,
  contact = {},
  answers,
  questionOrder,
} = {}) {
  const result = resolveScoringResult({ scoringResult, answers, questionOrder });
  const contactPayload = resolveContact(contact);
  const normalizedAnswers = result.answers ?? normalizeNarcissismRiskAnswers(answers);
  const normalizedQuestionOrder = normalizeNarcissismRiskQuestionOrder(
    result.question_order ?? questionOrder
  );
  const primaryRiskDimensions =
    result.primary_risk_dimensions?.length > 0
      ? result.primary_risk_dimensions
      : getNarcissismRiskPrimaryDimensions(result.dimension_scores);

  return {
    assessment_type: NARCISSISM_RISK_ASSESSMENT_TYPE,
    total_score: result.total_score,
    dynamic_full_score: NARCISSISM_RISK_FULL_SCORE,
    score_rate: result.score_rate,
    result_level: result.result_level,
    result_label: result.result_label,
    dimension_scores: result.dimension_scores,
    answers: normalizedAnswers,
    contact_name: contactPayload.contact_name,
    contact_phone: contactPayload.contact_phone,
    contact_wechat: contactPayload.contact_wechat,
    submission_source: "narcissism_risk_web",
    follow_up_status: "new",
    result_payload: {
      average_score: result.average_score,
      score_direction: "higher_is_riskier",
      high_risk_triggered: Boolean(result.high_risk_triggered),
      high_risk_items: [...(result.high_risk_items ?? [])],
      primary_risk_dimensions: [...primaryRiskDimensions],
      question_order: normalizedQuestionOrder,
    },
  };
}
