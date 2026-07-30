"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Application, Assignment, Review } from "@/lib/types";
import { CRITERIA } from "@/lib/scoring";
import { ReviewScore } from "@/lib/types";

type DetailData = {
  application: Application;
  assignments: Assignment[];
  reviews: Review[];
};

export default function ApplicationDetail() {
  const { uscId } = useParams<{ uscId: string }>();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/applications/${uscId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [uscId]);

  if (loading) return <p className="p-8">Loading…</p>;
  if (!data?.application) return <p className="p-8">Not found.</p>;

  const app = data.application;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{app.name}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {app.year} · {app.majorMinor} · {app.email}
      </p>

      <section className="space-y-4">
        <Field label="Why do you want to join?" value={app.whyJoin} />
        <Field label="Personal AI story" value={app.aiResponse} />
        <Field label="Programming / ML experience" value={app.experienceResponse} />
        <Field label="AI social issue proposal" value={app.socialResponse} />
        <Field label="Passion response" value={app.passionResponse} />
      </section>
      <ReviewForm
        uscId={uscId}
        onSubmitted={() => {
          fetch(`/api/applications/${uscId}`)
            .then((r) => r.json())
            .then((d) => setData(d));
        }}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

export function ReviewForm({ uscId, onSubmitted }: { uscId: string; onSubmitted: () => void }) {
  const [scores, setScores] = useState<Record<string, ReviewScore | null>>({
    experienceScore: null,
    researchScore: null,
    qualityScore: null,
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allScored = Object.values(scores).every((s) => s !== null);

  async function handleSubmit() {
    if (!allScored) return;
    setSubmitting(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uscId, ...scores, notes }),
    });
    setSubmitting(false);
    onSubmitted();
  }

  return (
    <div className="border rounded-lg p-4 mt-6 space-y-4">
      <h2 className="font-bold">Your Review</h2>

      {CRITERIA.map((criterion) => (
        <div key={criterion.key}>
          <p className="text-sm font-semibold mb-1">{criterion.label}</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setScores({ ...scores, [criterion.key]: n as ReviewScore })}
                className={`px-3 py-1 rounded border text-sm ${
                  scores[criterion.key] === n
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent"
                }`}
                title={criterion.levels[n as 1 | 2 | 3]}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="text-sm font-semibold mb-1">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded p-2 text-sm bg-transparent"
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allScored || submitting}
        className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}