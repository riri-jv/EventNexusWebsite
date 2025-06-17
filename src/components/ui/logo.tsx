import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        EventNexus
      </span>
    </Link>
  );
}