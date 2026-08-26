"use client";

import { useEffect, useState } from "react";

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

export default function Results() {
  const [results, setResults] =
    useState<Result[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

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

  if (loading) {
    return (
      <p className="p-8">
        Loading...
      </p>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Results
      </h1>

      <ul className="space-y-2">
        {results.map(
          (result, index) => {
            const isExpanded =
              expandedId ===
              result.application.uscId;

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
                        result.decision ===
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
                        result.decision ===
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
                              <div className="flex items-start justify-between mb-3">
                                <div>
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
                                        {review.overallScore}
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
    </div>
  );
}