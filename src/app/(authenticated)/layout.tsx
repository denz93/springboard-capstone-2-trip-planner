import { getAuthSession } from "@/server/modules/auth/auth.helper";
import { redirect } from "next/navigation";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session.userId) {
    redirect("/login");
  }
  return (
    <div className="min-h-[calc(100svh-136px-4rem)] my-8 px-6">{children}</div>
  );
}
