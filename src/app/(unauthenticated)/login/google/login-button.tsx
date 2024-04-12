import { FaGoogle } from "react-icons/fa6";
import Link from "next/link";

export default function GoogleLoginButton({
  redirect = "/"
}: {
  redirect?: string;
}) {
  return (
    <Link
      className="btn btn-outline btn-wide"
      href={`/login/google/handler?__redirect=${redirect}`}
    >
      <FaGoogle /> Google Login
    </Link>
  );
}
