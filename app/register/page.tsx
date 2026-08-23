"use client";
import { Nav } from "@/components/Nav";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 font-display text-3xl font-bold">Create a POAP</h1>
        <p className="mb-8 text-ink/60">
          This writes directly to the OnchainPOAPs contract on Base Sepolia — there's no draft state, no
          backend database. What you submit here is what gets stored onchain.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
