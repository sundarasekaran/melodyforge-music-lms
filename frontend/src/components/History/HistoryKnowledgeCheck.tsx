import React, { useState } from 'react';
import { KnowledgeCheckQuestion } from '../../types';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface HistoryKnowledgeCheckProps {
  questions: KnowledgeCheckQuestion[];
  onPassed?: (scorePercent: number) => void;
  isCompleted?: boolean;
}

export const HistoryKnowledgeCheck: React.FC<HistoryKnowledgeCheckProps> = ({
  questions,
  onPassed,
  isCompleted = false,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(isCompleted);
  const [currentScore, setCurrentScore] = useState<number>(isCompleted ? 100 : 0);

  if (!questions || questions.length === 0) return null;

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (submitted && !isCompleted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    setCurrentScore(scorePercent);
    setSubmitted(true);

    if (scorePercent >= 70 && onPassed) {
      onPassed(scorePercent);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);
  const isPassed = currentScore >= 70;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Chapter Knowledge Check</h4>
            <p className="text-xs text-slate-400">Test your comprehension of this historical milestone</p>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${
              isPassed
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}>
              Score: {currentScore}% {isPassed ? '• Passed' : '• Try Again'}
            </span>
          </div>
        )}
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = selected === q.correctIndex;

          return (
            <div key={q.id} className="space-y-3">
              <h5 className="text-sm font-semibold text-slate-200 flex items-start gap-2">
                <span className="font-mono text-amber-400 font-bold shrink-0">{qIndex + 1}.</span>
                <span>{q.question}</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIndex) => {
                  const isThisSelected = selected === optIndex;
                  const isThisCorrect = optIndex === q.correctIndex;

                  let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900';
                  if (submitted) {
                    if (isThisCorrect) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/10';
                    } else if (isThisSelected && !isThisCorrect) {
                      btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-300 line-through';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                    }
                  } else if (isThisSelected) {
                    btnStyle = 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20';
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span className="leading-snug">{opt}</span>
                      {submitted && isThisCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-2" />
                      )}
                      {submitted && isThisSelected && !isThisCorrect && (
                        <XCircle size={16} className="text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Explanation on Submit */}
              {submitted && (
                <div className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                  isCorrect
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}>
                  <span className="font-bold text-amber-400 block mb-0.5">Historical Fact Check:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {!submitted ? (
          <Button
            variant="amber"
            size="md"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            rightIcon={<ArrowRight size={16} />}
          >
            Check Answers & Verify Facts
          </Button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isPassed && (
              <Button
                variant="outline"
                size="md"
                onClick={handleRetry}
                leftIcon={<RotateCcw size={15} />}
              >
                Retry Knowledge Check
              </Button>
            )}
            {isPassed && (
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                <CheckCircle2 size={16} /> Knowledge check passed (+XP ready to claim)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
