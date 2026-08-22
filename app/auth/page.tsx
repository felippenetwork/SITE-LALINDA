import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acesso Administrativo | La Linda",
};

export default function AuthPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
