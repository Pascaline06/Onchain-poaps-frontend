"use client";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 font-display text-3xl font-bold">Create a POAP</h1>
        <p className="mb-8 text-ink/60">
          There's no draft state and no undo button here — this writes straight to the contract. What
          you submit below is what ends up onchain.
        </p>
        <RegisterForm />
      </div>
      <Footer />
    </main>
  );
}
