"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Application,
  DecisionValue,
  Review,
} from "@/lib/types";

import { reviewerName } from "@/config/reviewers";

type Result = {
  application: Application;
  reviewCount: number;
  reviews: Review[];
  averages: {
    experienceScore: number;
    researchScore: number;
    qualityScore: number;
    overall: number;
  } | null;
  decision: DecisionValue;
};

type FilterMode = "experience" | "overall";

const EXPERIENCE_SCORES = [
  1,
  1.5,
  2,
  2.5,
  3,
];

const OVERALL_SCORES = [
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
];

export default function Results() {
  const [results, setResults] =
    useState<Result[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [filterMode, setFilterMode] =
    useState<FilterMode>("overall");

  const [selectedScores, setSelectedScores] =
    useState<number[]>([]);

  const [
    autoRejectThreshold,
    setAutoRejectThreshold,
  ] = useState("2");

  async function load() {
    const response = await fetch(
      "/api/results"
    );

    const data = await response.json();

    setResults(data.results ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(
    uscId: string,
    decision: DecisionValue
  ) {
    await fetch(
      "/api/decisions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          uscId,
          decision,
        }),
      }
    );

    await load();
  }

  function toggleExpanded(uscId: string) {
    setExpandedId((current) =>
      current === uscId
        ? null
        : uscId
    );
  }

  function changeFilterMode(
    mode: FilterMode
  ) {
    setFilterMode(mode);

    // Filters are independent, so switching
    // categories clears the previous selection.
    setSelectedScores([]);
  }

  function toggleScore(score: number) {
    setSelectedScores((current) =>
      current.includes(score)
        ? current.filter(
            (value) => value !== score
          )
        : [...current, score]
    );
  }

  function clearFilters() {
    setSelectedScores([]);
  }

  const scoreOptions =
    filterMode === "experience"
      ? EXPERIENCE_SCORES
      : OVERALL_SCORES;

  const filteredResults = useMemo(() => {
    // No selected scores means show everything.
    if (selectedScores.length === 0) {
      return results;
    }

    return results.filter((result) => {
      if (!result.averages) {
        return false;
      }

      const score =
        filterMode === "experience"
          ? result.averages.experienceScore
          : result.averages.overall;

      return selectedScores.includes(score);
    });
  }, [
    results,
    filterMode,
    selectedScores,
  ]);

  function getEffectiveDecision(
    result: Result
  ): DecisionValue {
    // Explicit manual decisions take priority.
    if (
      result.decision === "accepted" ||
      result.decision === "rejected"
    ) {
      return result.decision;
    }

    const threshold =
      Number(autoRejectThreshold);

    const hasBothReviews =
      result.reviewCount >= 2;

    const shouldAutoReject =
      result.averages &&
      hasBothReviews &&
      !Number.isNaN(threshold) &&
      result.averages.overall < threshold;

    if (shouldAutoReject) {
      return "rejected";
    }

    return "undecided";
  }

  if (loading) {
    return (
      <p className="p-8">
        Loading...
      </p>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Results
      </h1>

      {/* Filters */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">
            Filter applications
          </h2>

          {selectedScores.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Filter category */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() =>
              changeFilterMode("experience")
            }
            className={`px-3 py-1.5 rounded text-sm border ${
              filterMode === "experience"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-transparent"
            }`}
          >
            Experience
          </button>

          <button
            onClick={() =>
              changeFilterMode("overall")
            }
            className={`px-3 py-1.5 rounded text-sm border ${
              filterMode === "overall"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-transparent"
            }`}
          >
            Overall
          </button>
        </div>

        {/* Exact score multi-select */}
        <div>
          <p className="text-sm font-medium mb-2">
            Average{" "}
            {filterMode === "experience"
              ? "Experience"
              : "Overall"}{" "}
            score
          </p>

          <div className="flex flex-wrap gap-2">
            {scoreOptions.map((score) => {
              const selected =
                selectedScores.includes(score);

              return (
                <button
                  key={score}
                  onClick={() =>
                    toggleScore(score)
                  }
                  className={`min-w-12 px-3 py-1.5 rounded border text-sm ${
                    selected
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {score}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select one or more scores.
          </p>
        </div>
      </div>

      {/* Auto reject */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">
          Auto-reject
        </h2>

        <div className="flex items-center gap-3">
          <label
            htmlFor="auto-reject"
            className="text-sm"
          >
            Reject applications with an average
            Overall score below
          </label>

          <input
            id="auto-reject"
            type="number"
            min="1"
            max="4"
            step="0.5"
            value={autoRejectThreshold}
            onChange={(event) =>
              setAutoRejectThreshold(
                event.target.value
              )
            }
            className="w-20 border rounded p-2 bg-transparent text-sm"
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Auto-rejection only applies after both
          reviewers have submitted their reviews.
        </p>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Showing {filteredResults.length} of{" "}
        {results.length} applications
      </p>

      <ul className="space-y-2">
        {filteredResults.map(
          (result, index) => {
            const isExpanded =
              expandedId ===
              result.application.uscId;

            const effectiveDecision =
              getEffectiveDecision(result);

            const isAutoRejected =
              effectiveDecision === "rejected" &&
              result.decision !==
                "rejected";

            return (
              <li
                key={
                  result.application.uscId
                }
                className="border rounded-lg overflow-hidden"
              >
                <div className="p-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      toggleExpanded(
                        result.application.uscId
                      )
                    }
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <div>
                      <p className="font-medium">
                        {index + 1}.{" "}
                        {
                          result.application
                            .name
                        }
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {
                          result.reviewCount
                        }{" "}
                        review
                        {result.reviewCount !==
                        1
                          ? "s"
                          : ""}

                        {isAutoRejected &&
                          " · Auto-rejected"}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      {result.averages ? (
                        <>
                          <p className="font-semibold">
                            {
                              result.averages
                                .overall
                                .toFixed(1)
                            }
                          </p>

                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Exp{" "}
                            {
                              result.averages
                                .experienceScore
                                .toFixed(1)
                            }{" "}
                            · Res{" "}
                            {
                              result.averages
                                .researchScore
                                .toFixed(1)
                            }{" "}
                            · Qual{" "}
                            {
                              result.averages
                                .qualityScore
                                .toFixed(1)
                            }
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-400">
                          —
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {isExpanded
                          ? "Hide reviews ↑"
                          : "View reviews ↓"}
                      </p>
                    </div>
                  </button>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() =>
                        decide(
                          result.application
                            .uscId,
                          "accepted"
                        )
                      }
                      className={`px-2 py-1 rounded text-xs border ${
                        effectiveDecision ===
                        "accepted"
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-400"
                      }`}
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        decide(
                          result.application
                            .uscId,
                          "rejected"
                        )
                      }
                      className={`px-2 py-1 rounded text-xs border ${
                        effectiveDecision ===
                        "rejected"
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-400"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 py-4 bg-gray-50 dark:bg-gray-900">
                    {result.reviews.length ===
                    0 ? (
                      <p className="text-sm text-gray-500">
                        No reviews submitted yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {result.reviews.map(
                          (review) => (
                            <div
                              key={
                                review.reviewerEmail
                              }
                              className="border rounded-lg p-4 bg-white dark:bg-black"
                            >
                              <div className="mb-3">
                                <p className="font-medium">
                                  {reviewerName(
                                    review.reviewerEmail
                                  )}
                                </p>

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {
                                    review.reviewerEmail
                                  }
                                </p>
                              </div>

                              <div className="grid grid-cols-4 gap-2 text-sm mb-4">
                                <div className="border rounded p-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Experience
                                  </p>

                                  <p className="font-semibold text-lg">
                                    {
                                      review.experienceScore
                                    }
                                  </p>
                                </div>

                                <div className="border rounded p-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Research
                                  </p>

                                  <p className="font-semibold text-lg">
                                    {
                                      review.researchScore
                                    }
                                  </p>
                                </div>

                                <div className="border rounded p-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Quality
                                  </p>

                                  <p className="font-semibold text-lg">
                                    {
                                      review.qualityScore
                                    }
                                  </p>
                                </div>

                                <div className="border rounded p-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Overall
                                  </p>

                                  <p className="font-semibold text-lg">
                                    {
                                      review.overallScore
                                    }
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Notes
                                </p>

                                <p className="text-sm whitespace-pre-wrap">
                                  {
                                    review.notes ||
                                    "No notes provided."
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          }
        )}
      </ul>

      {filteredResults.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          No applications match the selected
          scores.
        </p>
      )}
    </div>
  );
}