import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acesso da Equipe de Vendas | La Linda",
};

export default function VendasLoginPage() {
  return <LoginForm />;
}
