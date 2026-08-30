"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Application,
  Assignment,
  Review,
} from "@/lib/types";
import { useSession } from "@/lib/auth-client";
import { reviewerName } from "@/config/reviewers";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Item = {
  application: Application;
  assignments: Assignment[];
  reviews: Review[];
};

const ADMIN_EMAIL = "anniegao@usc.edu";

function DashboardContent() {
  const searchParams = useSearchParams();

  const initialFilter =
    searchParams.get("filter") === "mine"
      ? "mine"
      : searchParams.get("filter") === "unassigned"
        ? "unassigned"
        : "all";

  const initialReviewFilter =
    searchParams.get("reviewFilter") === "awaiting"
      ? "awaiting"
      : searchParams.get("reviewFilter") === "reviewed"
        ? "reviewed"
        : "all";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<
    "all" | "mine" | "unassigned"
  >(initialFilter);

  const [myReviewFilter, setMyReviewFilter] =
    useState<
      "all" | "awaiting" | "reviewed"
    >(initialReviewFilter);

  const [autoAssigning, setAutoAssigning] =
    useState(false);

  const [rebalancing, setRebalancing] =
    useState(false);

  const { data: session } = useSession();

  const myEmail = session?.user?.email;

  const isAdmin =
    myEmail === ADMIN_EMAIL;

  const awaitingReviewCount = items.filter((item) =>
    item.assignments.some(
      (assignment) =>
        assignment.reviewerEmail === myEmail &&
        assignment.status === "assigned"
    )
  ).length;

  const reviewedCount = items.filter((item) =>
    item.assignments.some(
      (assignment) =>
        assignment.reviewerEmail === myEmail &&
        assignment.status === "completed"
    )
  ).length;

  const visibleItems = items.filter((item) => {
    if (filter === "all") return true;

    if (filter === "unassigned") {
      return (
        item.assignments.filter(
          (assignment) =>
            assignment.status === "assigned" ||
            assignment.status === "completed"
        ).length === 0
      );
    }

    if (filter === "mine") {
      const myAssignment =
        item.assignments.find(
          (assignment) =>
            assignment.reviewerEmail ===
            myEmail
        );

      if (!myAssignment) {
        return false;
      }

      if (
        myAssignment.status !== "assigned" &&
        myAssignment.status !== "completed"
      ) {
        return false;
      }

      if (myReviewFilter === "awaiting") {
        return (
          myAssignment.status === "assigned"
        );
      }

      if (myReviewFilter === "reviewed") {
        return (
          myAssignment.status === "completed"
        );
      }

      return true;
    }

    return true;
  });

  function loadItems() {
    return fetch("/api/applications")
      .then((response) =>
        response.json()
      )
      .then((data) => {
        setItems(data.items);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function autoAssignReviewers() {
    const confirmed = window.confirm(
      "Assign two reviewers to all applications that still need reviewers?"
    );

    if (!confirmed) return;

    setAutoAssigning(true);

    try {
      const response = await fetch(
        "/api/assignments/auto",
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ??
            "Failed to assign reviewers."
        );

        return;
      }

      if (
        data.assignmentsCreated === 0
      ) {
        alert(
          "All applications already have two reviewers."
        );
      } else {
        alert(
          `Created ${data.assignmentsCreated} reviewer assignments.`
        );
      }

      await loadItems();
    } finally {
      setAutoAssigning(false);
    }
  }

  async function rebalanceReviewers() {
    const confirmed = window.confirm(
      "Rebalance all unread applications?\n\nCompleted reviews will stay with their current reviewers. Unread applications may be reassigned to balance everyone's remaining workload."
    );

    if (!confirmed) return;

    setRebalancing(true);

    try {
      const response = await fetch(
        "/api/assignments/rebalance",
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ??
            "Failed to rebalance applications."
        );

        return;
      }

      if (
        data.assignmentsMoved === 0
      ) {
        alert(
          "The unread applications are already balanced."
        );
      } else {
        alert(
          `Rebalanced ${data.assignmentsMoved} unread reviewer assignments.`
        );
      }

      await loadItems();
    } finally {
      setRebalancing(false);
    }
  }

  function selectFilter(
    newFilter:
      | "all"
      | "mine"
      | "unassigned"
  ) {
    setFilter(newFilter);

    if (newFilter !== "mine") {
      setMyReviewFilter("all");
    }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Applications
        </h1>

        <div className="flex gap-2">
          <button
            onClick={autoAssignReviewers}
            disabled={autoAssigning}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-40"
          >
            {autoAssigning
              ? "Assigning..."
              : "Assign new applications"}
          </button>

          {isAdmin && (
            <button
              onClick={rebalanceReviewers}
              disabled={rebalancing}
              className="px-3 py-2 rounded border disabled:opacity-40"
            >
              {rebalancing
                ? "Rebalancing..."
                : "Rebalance unread applications"}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {(
          [
            "all",
            "mine",
            "unassigned",
          ] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() =>
              selectFilter(f)
            }
            className={`px-3 py-1 rounded ${
              filter === f
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "mine"
                ? "Assigned to me"
                : "Unassigned"}
          </button>
        ))}
      </div>

      {filter === "mine" && (
        <div className="flex gap-2 mb-4">
          {(
            [
              "all",
              "awaiting",
              "reviewed",
            ] as const
          ).map((f) => (
            <button
              key={f}
              onClick={() =>
                setMyReviewFilter(f)
              }
              className={`px-3 py-1 rounded text-sm ${
                myReviewFilter === f
                  ? "bg-gray-700 text-white dark:bg-gray-200 dark:text-black"
                  : "border text-gray-600 dark:text-gray-300"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "awaiting"
                  ? `Awaiting review (${awaitingReviewCount})`
                  : `Reviewed (${reviewedCount})`}
            </button>
          ))}
        </div>
      )}

      <ul className="space-y-2">
        {visibleItems.map((item) => (
          <li
            key={
              item.application.uscId
            }
            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Link
              href={`/applications/${item.application.uscId}`}
              className="block mb-2"
            >
              <p className="font-medium">
                {
                  item.application
                    .name
                }
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {
                  item.application
                    .year
                }{" "}
                ·{" "}
                {
                  item.application
                    .majorMinor
                }
              </p>
            </Link>

            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                {item.assignments
                  .length === 0
                  ? "Unassigned"
                  : item.assignments
                      .map(
                        (
                          assignment
                        ) =>
                          `${reviewerName(
                            assignment.reviewerEmail
                          )} (${assignment.status})`
                      )
                      .join(", ")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {visibleItems.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          {filter === "mine" &&
          myReviewFilter ===
            "awaiting"
            ? "You have no applications awaiting review."
            : filter === "mine" &&
                myReviewFilter ===
                  "reviewed"
              ? "You have no completed reviews yet."
              : "No applications found."}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
