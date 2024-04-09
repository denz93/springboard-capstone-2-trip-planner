"use client";

export default function Error({ error }) {
  return (
    <section className="text-center">
      <h1>Something Went Wrong</h1>
      <p>{error.message}</p>
    </section>
  );
}
