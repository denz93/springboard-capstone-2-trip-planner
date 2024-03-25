"use client";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="prose max-w-none text-center">
      <h2>Somthing went wrong</h2>
      <p className="italic">{error.message}</p>
      <div className="flex gap-4 justify-center">
        <button className="btn btn-default btn-outline" onClick={() => reset()}>
          Reset
        </button>
        <Link href="/" className="btn btn-success btn-outline">
          Go Home
        </Link>
      </div>
    </div>
  );
}
