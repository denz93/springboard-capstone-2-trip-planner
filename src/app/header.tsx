import { getUser } from "@/app/helpers/server/auth";
import Navbar from "@/app/navbar";

export async function Header() {
  const user = await getUser();
  const isLogin = !!user;

  return (
    <header className="border-b-[1px]">
      <Navbar initialUser={user} />
    </header>
  );
}
