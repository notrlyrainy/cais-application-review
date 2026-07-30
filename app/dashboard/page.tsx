"use client";
import {useEffect, useState} from "react";
import {Application, Assignment, Review} from "@/lib/types";
import {useSession} from "@/lib/auth-client";
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
    const {data : session} = useSession();
    const myEmail = session?.user?.email;

    const visibleItems = items.filter((item) => {
        if(filter === "all") return true;
        if(filter === "unassigned") return item.assignments.length === 0;
        if(filter === "mine") return item.assignments.some((a) => a.reviewerEmail === myEmail);
        return true;
    })
    useEffect(() => {
        fetch("/api/applications")
        .then((r) => r.json())
        .then((data) => {
            setItems(data.items);
            setLoading(false);
        });
    }, []);

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
                {visibleItems.map((item) => (
                    <li key={item.application.uscId} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Link href={`/applications/${item.application.uscId}`} className="block">
                            <p className="font-medium">{item.application.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.application.year} · {item.application.majorMinor}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}