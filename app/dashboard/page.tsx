"use client";
import {useEffect, useState} from "react";
import {Application, Assignment, Review} from "@/lib/types";
import {useSession} from "@/lib/auth-client";
import {reviewerName} from "@/config/reviewers";
import Link from "next/link";

type Item = {
    application: Application;
    assignments: Assignment[];
    reviews: Review[];
};

export default function Dashboard(){
    const[items, setItems] = useState<Item[]>([]);
    const[loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "mine" | "unassigned">("all");
    const [assigning, setAssigning] = useState<string | null>(null);
    const {data : session} = useSession();
    const myEmail = session?.user?.email;

    const visibleItems = items.filter((item) => {
        if(filter === "all") return true;
        if(filter === "unassigned") return item.assignments.length === 0;
        if(filter === "mine") return item.assignments.some((a) => a.reviewerEmail === myEmail);
        return true;
    })

    function loadItems() {
        return fetch("/api/applications")
        .then((r) => r.json())
        .then((data) => {
            setItems(data.items);
            setLoading(false);
        });
    }

    useEffect(() => {
        loadItems();
    }, []);

    async function assignToMe(uscId: string) {
        setAssigning(uscId);
        await fetch("/api/assignments", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({uscId}),
        });
        await loadItems();
        setAssigning(null);
    }

    if(loading) return <p className="p-8">Loading...</p>;

    return(
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Applications</h1>
            <div className="flex gap-2 mb-4">
                {(["all", "mine", "unassigned"] as const).map((f) => (
                    <button
                    key={f}
                    onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded ${
                            filter === f
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                    >
                    {f === "all" ? "All" : f === "mine" ? "Assigned to me" : "Unassigned"}
                    </button>
                ))}
            </div>

            <ul className="space-y-2">
                {visibleItems.map((item) => {
                    const iAmAssigned = item.assignments.some((a) => a.reviewerEmail === myEmail);
                    return (
                        <li key={item.application.uscId} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Link href={`/applications/${item.application.uscId}`} className="block mb-2">
                                <p className="font-medium">{item.application.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.application.year} · {item.application.majorMinor}
                                </p>
                            </Link>
                            <div className="flex items-center justify-between text-sm">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {item.assignments.length === 0
                                        ? "Unassigned"
                                        : item.assignments
                                            .map((a) => `${reviewerName(a.reviewerEmail)} (${a.status})`)
                                            .join(", ")}
                                </p>
                                {myEmail && !iAmAssigned && (
                                    <button
                                        onClick={() => assignToMe(item.application.uscId)}
                                        disabled={assigning === item.application.uscId}
                                        className="px-2 py-1 rounded border text-xs disabled:opacity-40"
                                    >
                                        {assigning === item.application.uscId ? "Assigning…" : "Assign to me"}
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}
