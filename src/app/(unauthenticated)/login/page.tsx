import { FaGoogle } from "react-icons/fa6";
import LoginForm from "./login-form";
import GoogleLoginButton from "./google/login-button";

export default function Login() {
  return (
    <section className="flex flex-col items-center">
      <h1 className="">Login</h1>

      <div className="join join-vertical w-full max-w-96">
        <div className="join-item collapse justify-center collapse-arrow ">
          <input type="checkbox" name="login-accordion" />
          <h3 className="collapse-title">Email / Password Login</h3>
          <div className="collapse-content">
            <LoginForm />
          </div>
        </div>

        <div className="divider join-item">OR</div>
        <div className="join-item collapse justify-center w-full">
          <div className="collapse-title pe-4">
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </section>
  );
}
