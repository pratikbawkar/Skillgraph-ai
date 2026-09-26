'use client';

import Link from 'next/link';
import { useState } from 'react';
import { setQuizResult } from '@/lib/progress-store';
import type { SkillQuiz } from '@/lib/types';

interface QuizPlayerProps {
  roleId: string;
  skillId: string;
  skillName: string;
  quiz: SkillQuiz;
}

export function QuizPlayer({ roleId, skillId, skillName, quiz }: QuizPlayerProps) {
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedByQuestion).length;
  const correctCount = quiz.questions.filter(
    (question) => selectedByQuestion[question.id] === question.correctOptionIndex
  ).length;

  function selectOption(questionId: string, optionIndex: number) {
    setChecked(false);
    setSelectedByQuestion((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleCheckAnswers() {
    setChecked(true);
    setQuizResult(roleId, skillId, { correctCount, totalQuestions });
  }

  function handleRetake() {
    setSelectedByQuestion({});
    setChecked(false);
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{skillName} quiz</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">{totalQuestions} questions</span>
      </div>
      <div className="space-y-4">
        {quiz.questions.map((question, questionIndex) => (
          <fieldset key={question.id}>
            <legend className="text-sm text-gray-700 dark:text-gray-300">
              {questionIndex + 1}. {question.question}
            </legend>
            <div className="mt-1 space-y-1">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedByQuestion[question.id] === optionIndex;
                const isCorrectOption = optionIndex === question.correctOptionIndex;
                const feedbackClass =
                  checked && isSelected && isCorrectOption
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : checked && isSelected && !isCorrectOption
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      : checked && isCorrectOption
                        ? 'bg-emerald-50/60 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'text-gray-600 dark:text-gray-400';
                return (
                  <label
                    key={optionIndex}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${feedbackClass}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={isSelected}
                      onChange={() => selectOption(question.id, optionIndex)}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheckAnswers}
          disabled={answeredCount < totalQuestions}
          className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check answers
        </button>
        {checked && (
          <button
            type="button"
            onClick={handleRetake}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Retake quiz
          </button>
        )}
      </div>
      {checked && (
        <>
          <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            Score: {correctCount}/{totalQuestions}
          </p>
          <Link
            href={`/roles/${roleId}/skills/${skillId}`}
            className="mt-3 inline-block text-xs text-brand hover:underline dark:text-brand-light"
          >
            ← Back to {skillName}
          </Link>
        </>
      )}
    </div>
  );
}
