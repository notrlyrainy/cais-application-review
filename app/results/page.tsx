"use client";
import {useEffect, useState} from "react";
import {Application} from "@/lib/types";

type Result = {
    application: Application;
    reviewCount: number;
    averages: {
        experienceScore: number,
        researchScore: number,
        qualityScore: number,
        overall: number,
    } | null;
};

export default function Results() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

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
                            <p className="font-semibold">{result.averages.overall.toFixed(1)}</p>
                        ): (
                            <p className="text-gray-400">—</p>
                        )}
                    </div>
                </li>
              ))}
            </ul>
        </div>
    );
}