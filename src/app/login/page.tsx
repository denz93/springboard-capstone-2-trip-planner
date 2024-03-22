import LoginForm from "./login-form";

export default function Login() {
  return (
    <section className="flex flex-col items-center">
      <h1 className="text-3xl my-10">Login</h1>

      <h2 className="text-xl">Email / Password Login</h2>
      <LoginForm />
    </section>
  );
}
