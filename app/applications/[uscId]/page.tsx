"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Application,
  Assignment,
  Review,
  ReviewScore,
} from "@/lib/types";
import { CRITERIA } from "@/lib/scoring";
import { useSession } from "@/lib/auth-client";
import { reviewerName } from "@/config/reviewers";
import Link from "next/link";

type DetailData = {
  application: Application;
  assignments: Assignment[];
  reviews: Review[];
};

export default function ApplicationDetail() {
  const { uscId } =
    useParams<{ uscId: string }>();

  const [data, setData] =
    useState<DetailData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [working, setWorking] =
    useState(false);

  const { data: session } = useSession();

  const myEmail = session?.user?.email;

  function reload() {
    return fetch(
      `/api/applications/${uscId}`
    )
      .then((response) => response.json())
      .then((result) => setData(result));
  }

  useEffect(() => {
    reload().then(() => setLoading(false));
  }, [uscId]);

  if (loading) {
    return <p className="p-8">Loading…</p>;
  }

  if (!data?.application) {
    return <p className="p-8">Not found.</p>;
  }

  const app = data.application;

  const activeAssignment =
    data.assignments.find(
      (assignment) =>
        assignment.reviewerEmail === myEmail &&
        assignment.status === "assigned"
    );

  const recusedAssignment =
    data.assignments.find(
      (assignment) =>
        assignment.reviewerEmail === myEmail &&
        assignment.status === "recused"
    );

  const iReviewed = data.reviews.some(
    (review) =>
      review.reviewerEmail === myEmail
  );

  const canReview = Boolean(activeAssignment);

  async function recuse() {
    setWorking(true);

    try {
      const response = await fetch(
        "/api/assignments/recuse",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            uscId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.error ??
            "Failed to recuse from application."
        );

        return;
      }

      alert(
        `${result.replacementReviewer.name} has been assigned as your replacement.`
      );

      await reload();
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="text-sm underline mb-4 inline-block"
      >
        ← Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-1">
        {app.name}
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {app.year} · {app.majorMinor} ·{" "}
        {app.email}
      </p>

      <div className="flex items-center justify-between text-sm border rounded-lg p-3 mb-6">
        <p className="text-gray-500 dark:text-gray-400">
          {data.assignments.length === 0
            ? "Unassigned"
            : data.assignments
                .filter(
                  (assignment) =>
                    assignment.status !==
                    "reassigned"
                )
                .map(
                  (assignment) =>
                    `${reviewerName(
                      assignment.reviewerEmail
                    )} (${assignment.status})`
                )
                .join(", ")}
        </p>

        {canReview && (
          <button
            onClick={recuse}
            disabled={working}
            className="px-2 py-1 rounded border text-xs text-red-600 dark:text-red-400 disabled:opacity-40"
          >
            Recuse (conflict of interest)
          </button>
        )}
      </div>

      <section className="space-y-4">
        <Field
          label="Why do you want to join?"
          value={app.whyJoin}
        />

        <Field
          label="Personal AI story"
          value={app.aiResponse}
        />

        <Field
          label="Programming / ML experience"
          value={app.experienceResponse}
        />

        <Field
          label="AI social issue proposal"
          value={app.socialResponse}
        />

        <Field
          label="Passion response"
          value={app.passionResponse}
        />
      </section>

      {iReviewed ? (
        <div className="mt-6 space-y-2">
          <h2 className="font-bold">
            Reviews
          </h2>

          {data.reviews.map((review) => (
            <div
              key={review.reviewerEmail}
              className="border rounded-lg p-4"
            >
              <p className="font-semibold text-sm">
                {reviewerName(
                  review.reviewerEmail
                )}

                {review.reviewerEmail ===
                  myEmail && " (you)"}
              </p>

              <p className="text-sm">
                Experience: {
                  review.experienceScore
                }{" "}
                · Research: {
                  review.researchScore
                }{" "}
                · Quality: {
                  review.qualityScore
                }
              </p>

              <p className="text-sm whitespace-pre-wrap">
                {review.notes}
              </p>
            </div>
          ))}
        </div>
      ) : canReview ? (
        <ReviewForm
          uscId={uscId}
          onSubmitted={reload}
        />
      ) : (
        <div className="mt-6 border rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {recusedAssignment
              ? "You have recused yourself from this application and cannot submit a review."
              : "You are not assigned to review this application."}
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">
        {label}
      </p>

      <p className="text-sm whitespace-pre-wrap">
        {value || "—"}
      </p>
    </div>
  );
}

export function ReviewForm({
  uscId,
  onSubmitted,
}: {
  uscId: string;
  onSubmitted: () => void;
}) {
  const [scores, setScores] =
    useState<
      Record<string, ReviewScore | null>
    >({
      experienceScore: null,
      researchScore: null,
      qualityScore: null,
    });

  const [notes, setNotes] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const allScored =
    Object.values(scores).every(
      (score) => score !== null
    );

  async function handleSubmit() {
    if (!allScored) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            uscId,
            ...scores,
            notes,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.error ??
            "Failed to submit review."
        );

        return;
      }

      await onSubmitted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 mt-6 space-y-4">
      <h2 className="font-bold">
        Your Review
      </h2>

      {CRITERIA.map((criterion) => (
        <div key={criterion.key}>
          <p className="text-sm font-semibold mb-1">
            {criterion.label}
          </p>

          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() =>
                  setScores({
                    ...scores,
                    [criterion.key]:
                      n as ReviewScore,
                  })
                }
                className={`px-3 py-1 rounded border text-sm ${
                  scores[criterion.key] === n
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent"
                }`}
                title={
                  criterion.levels[
                    n as 1 | 2 | 3
                  ]
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="text-sm font-semibold mb-1">
          Notes
        </p>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          className="w-full border rounded p-2 text-sm bg-transparent"
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          !allScored || submitting
        }
        className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black disabled:opacity-40"
      >
        {submitting
          ? "Submitting…"
          : "Submit Review"}
      </button>
    </div>
  );
}