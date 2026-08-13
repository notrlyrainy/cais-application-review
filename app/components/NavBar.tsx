import Link from "next/link";

export function NavBar() {
  return (
    <nav className="border-b p-4 flex gap-4 text-sm">
      <Link href="/dashboard" className="hover:underline">Dashboard</Link>
      <Link href="/results" className="hover:underline">Results</Link>
    </nav>
  );
}