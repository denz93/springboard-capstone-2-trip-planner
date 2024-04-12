import { getAuthSession } from "@/server/modules/auth/auth.helper";
import { redirect } from "next/navigation";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (session.userId) {
    redirect("/");
  }
  return <>{children}</>;
}
