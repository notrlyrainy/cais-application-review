"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Application, Assignment, Review } from "@/lib/types";

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