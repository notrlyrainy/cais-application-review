"use client";
import {useEffect, useState} from "react";
import {Application, DecisionValue} from "@/lib/types";

type Result = {
    application: Application;
    reviewCount: number;
    averages: {
        experienceScore: number,
        researchScore: number,
        qualityScore: number,
        overall: number,
    } | null;
    decision: DecisionValue;
};

export default function Results() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        const r = await fetch("/api/results");
        const data = await r.json();
        setResults(data.results ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function decide(uscId: string, decision: DecisionValue) {
        await fetch("/api/decisions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uscId, decision }),
        });
        await load();
    }

    useEffect(() => {
        fetch("/api/results")
        .then((r) => r.json())
        .then((data) => {
            setResults(data.results);
            setLoading(false);
        });
    }, []);

    if(loading) return <p className="p-8"> Loading... </p>;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Results</h1>
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li
                    key={result.application.uscId}
                    className="border rounded-lg p-4 flex items-center justify-between"
                >
                    <div>
                        <p className="font-medium">
                            {index + 1}. {result.application.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {result.reviewCount} review{result.reviewCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="text-right text-sm">
                        {result.averages ? (
                            <>
                                <p className="font-semibold">{result.averages.overall.toFixed(1)}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Exp {result.averages.experienceScore.toFixed(1)} · 
                                    Res {result.averages.researchScore.toFixed(1)} · 
                                    Qual {result.averages.qualityScore.toFixed(1)}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-400">—</p>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => decide(result.application.uscId, "accepted")}
                            className={`px-2 py-1 rounded text-xs border ${
                                result.decision === "accepted"
                                    ? "bg-green-600 text-white border-green-600"
                                    : "border-gray-400"
                            }`}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => decide(result.application.uscId, "rejected")}
                            className={`px-2 py-1 rounded text-xs border ${
                                result.decision === "rejected"
                                    ? "bg-red-600 text-white border-red-600"
                                    : "border-gray-400"
                            }`}
                        >
                            Reject
                        </button>
                    </div>
                </li>
              ))}
            </ul>
        </div>
    );
}