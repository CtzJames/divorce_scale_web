export function buildSubmissionPayload({
  answers,
  resultData,
  submittedAt = new Date().toISOString(),
}) {
  const childGateAnswer = answers.SYS_CHILD_GATE ?? null;
  const crossBorderGateAnswer = answers.SYS_CROSS_BORDER_GATE ?? null;

  const weaknesses = (resultData.weaknesses || []).map((item) => item.code);
  const dimensionScores = resultData.dimensionScores || {};

  return {
    submittedAt,
    totalScore: resultData.totalScore,
    dynamicFullScore: resultData.dynamicFullScore,
    scoreRate: Number(resultData.scoreRate.toFixed(1)),
    resultLevel: resultData.levelKey,
    resultLabel: resultData.level.label,
    childGateAnswer,
    crossBorderGateAnswer,
    weaknesses,
    dimensionScores,
    answers,
  };
}
