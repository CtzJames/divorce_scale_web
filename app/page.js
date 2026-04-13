"use client";

import { useMemo, useRef, useState } from "react";
import { DIMENSION_META, FLOW, QUESTIONS, QUESTION_MAP } from "../data/questions.js";
import { RESULT_COPY } from "../data/resultCopy.js";
import { getLevelKey, getScore } from "../lib/scoring.js";
import { buildSubmissionPayload } from "../lib/buildSubmissionPayload.js";
import { supabase } from "../lib/supabaseClient.js";
import IntroScreen from "../components/IntroScreen.js";
import QuestionScreen from "../components/QuestionScreen.js";
import ResultScreen from "../components/ResultScreen.js";

export default function HomePage() {
    const [step, setStep] = useState("intro");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    

    const submitLockRef = useRef(false);

    const visibleQuestionIds = useMemo(() => {
        return FLOW.filter((id) => {
            if (id.startsWith("D3_") && answers.SYS_CHILD_GATE === "no") return false;
            if (id.startsWith("D7_") && answers.SYS_CROSS_BORDER_GATE === "no") {
                return false;
            }
            return true;
        });
    }, [answers]);

    const currentQuestionId = visibleQuestionIds[currentIndex];
    const currentQuestion = QUESTION_MAP[currentQuestionId];
    const currentAnswer = answers[currentQuestionId];
    const isLastQuestion = currentIndex === visibleQuestionIds.length - 1;

    const resultData = useMemo(() => {
        const skippedDimensions = {
            D3: answers.SYS_CHILD_GATE === "no",
            D7: answers.SYS_CROSS_BORDER_GATE === "no",
        };

        const dimensions = {};
        Object.keys(DIMENSION_META).forEach((code) => {
            dimensions[code] = {
                code,
                name: DIMENSION_META[code].name,
                total: 0,
                count: 0,
                avg: null,
                skipped: Boolean(skippedDimensions[code]),
            };
        });

        let totalScore = 0;
        let effectiveCount = 0;

        QUESTIONS.forEach((q) => {
            if (q.system) return;
            if (dimensions[q.dimension]?.skipped) return;

            const value = answers[q.id];
            const score = getScore(value, q.reverse);

            if (score === null) return;

            totalScore += score;
            effectiveCount += 1;
            dimensions[q.dimension].total += score;
            dimensions[q.dimension].count += 1;
        });

        Object.values(dimensions).forEach((item) => {
            if (!item.skipped && item.count > 0) {
                item.avg = item.total / item.count;
            }
        });

        const dynamicFullScore = effectiveCount * 5;
        const scoreRate =
            dynamicFullScore > 0 ? (totalScore / dynamicFullScore) * 100 : 0;
        const levelKey = getLevelKey(scoreRate);

        const validDimensions = Object.values(dimensions).filter(
            (item) => !item.skipped && item.avg !== null
        );

        let weaknesses = validDimensions
            .filter((item) => item.avg < 3)
            .sort((a, b) => a.avg - b.avg);

        if (weaknesses.length === 0) {
            weaknesses = [...validDimensions]
                .sort((a, b) => a.avg - b.avg)
                .slice(0, Math.min(2, validDimensions.length));
        }

        weaknesses = weaknesses.slice(0, 3).map((item) => ({
            ...item,
            hint: DIMENSION_META[item.code].hint,
            action: DIMENSION_META[item.code].action,
        }));

        return {
            totalScore,
            dynamicFullScore,
            scoreRate,
            levelKey,
            level: RESULT_COPY[levelKey],
            weaknesses,
        };
    }, [answers]);

    const handleStart = () => {
        setStep("question");
        setCurrentIndex(0);
        
    };

    const handleAnswer = (questionId, value) => {
        setAnswers((prev) => {
            const next = { ...prev, [questionId]: value };

            if (questionId === "SYS_CHILD_GATE" && value === "no") {
                ["D3_Q01", "D3_Q02", "D3_Q03", "D3_Q04"].forEach((id) => delete next[id]);
            }

            if (questionId === "SYS_CROSS_BORDER_GATE" && value === "no") {
                ["D7_Q01", "D7_Q02", "D7_Q03", "D7_Q04"].forEach((id) => delete next[id]);
            }

            return next;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        if (currentAnswer === undefined) return;

        if (isLastQuestion) {
            setStep("result");
            return;
        }

        setCurrentIndex((prev) =>
            Math.min(prev + 1, visibleQuestionIds.length - 1)
        );
    };

    const handleRestart = () => {
        setStep("intro");
        setCurrentIndex(0);
        setAnswers({});
        setHasSubmitted(false);
        submitLockRef.current = false;
    };

    const handleSubmitResult = async () => {
        if (submitLockRef.current || isSubmitting || hasSubmitted) return;

        submitLockRef.current = true;
        setIsSubmitting(true);

        try {
            const payload = buildSubmissionPayload({
                answers,
                resultData,
            });

            const { error } = await supabase.from("assessment_results").insert({
                total_score: payload.totalScore,
                dynamic_full_score: payload.dynamicFullScore,
                score_rate: payload.scoreRate,
                result_level: payload.resultLevel,
                result_label: payload.resultLabel,
                child_gate_answer: payload.childGateAnswer,
                cross_border_gate_answer: payload.crossBorderGateAnswer,
                weaknesses: payload.weaknesses,
                answers: payload.answers,
                submission_source: "web",
                follow_up_status: "new",
            });

            if (error) {
                console.error("提交失败：", error);
                alert("提交失败，请检查 Supabase 配置或表权限。");
                return;
            }

            setHasSubmitted(true);
            alert("您的测评结果已提交成功。");
        } finally {
            setIsSubmitting(false);
            submitLockRef.current = false;
        }
    };

    const progress =
        visibleQuestionIds.length > 0
            ? ((currentIndex + 1) / visibleQuestionIds.length) * 100
            : 0;

    if (step === "intro") {
        return <IntroScreen onStart={handleStart} />;
    }

    if (step === "question" && currentQuestion) {
        return (
            <QuestionScreen
                currentQuestion={currentQuestion}
                currentQuestionId={currentQuestionId}
                currentIndex={currentIndex}
                visibleQuestionIds={visibleQuestionIds}
                currentAnswer={currentAnswer}
                progress={progress}
                onAnswer={handleAnswer}
                onPrev={handlePrev}
                onNext={handleNext}
            />
        );
    }

    return (
        <>
            <ResultScreen
                resultData={resultData}
                onRestart={handleRestart}
                onSubmitResult={handleSubmitResult}
                isSubmitting={isSubmitting}
                hasSubmitted={hasSubmitted}
            />

            
        </>
    );
}