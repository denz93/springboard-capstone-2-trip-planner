import { getUser } from "../helpers/server/auth";
import ProfileUpdateForm from "./profile-update-form";

export default async function Profile() {
  const user = await getUser();
  if (!user) {
    throw new Error("You are not authorized to access this page");
  }
  return (
    <section>
      <h1 className="text-center">Profile</h1>
      <ProfileUpdateForm user={user} />
    </section>
  );
}
