import RegisterForm from "./register-form";

export default function Register() {
  return (
    <section className="flex flex-col items-center">
      <h1 className="text-3xl my-10">Register</h1>
      <RegisterForm />
    </section>
  );
}
