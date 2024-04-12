import { getUser } from "@/app/helpers/server/auth";
import Navbar from "@/app/navbar";

export async function Header() {
  const user = await getUser();
  const isLogin = !!user;

  return (
    <header className="sticky inset-y-0 z-10 border-b-2 border-gray-700">
      <Navbar initialUser={user} />
    </header>
  );
}
