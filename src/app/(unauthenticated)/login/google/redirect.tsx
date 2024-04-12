"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GoogleRedirect({ url }: { url: string }) {
  const objUrl = new URL(url);
  const router = useRouter();
  useEffect(() => {
    router.replace(url);
  }, [url]);
  return (
    <div className="w-full text-center">
      <div className="loading loading-ring"></div>
      <p>You are been redirecting to {objUrl.hostname}</p>
    </div>
  );
}
