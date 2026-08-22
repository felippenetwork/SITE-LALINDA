"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(
          error.message === "Invalid login credentials" ? "Credenciais inválidas" : error.message,
        );
        return;
      }

      toast.success("Bem-vindo de volta!");
      if (redirect) {
        window.location.href = redirect;
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      toast.error("Erro inesperado ao entrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 md:p-8 font-serif selection:bg-primary selection:text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-4 text-stone-400 font-sans uppercase tracking-widest text-[8px] md:text-[10px] font-black mb-8 md:mb-12 hover:text-foreground transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        ao Início
      </Link>

      <div className="w-full max-w-[450px]">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl italic text-stone-900 mb-4 leading-none">La Linda</h1>
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-primary block">
            Acesso Reservado
          </span>
        </div>

        <Card className="rounded-[2rem] md:rounded-[3rem] border-stone-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-10 text-center">
            <CardTitle className="text-xl md:text-2xl italic text-stone-900">
              Login Administrativo
            </CardTitle>
            <CardDescription className="font-sans text-stone-400 text-[10px] md:text-xs uppercase tracking-widest mt-2 font-bold">
              Gerencie seu catálogo artesanal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-[10px] uppercase tracking-widest font-black text-stone-400 flex items-center gap-2"
                >
                  <Mail size={12} /> E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@lalinda.com.br"
                  className="rounded-2xl border-stone-100 bg-stone-50 h-14 focus:ring-primary focus:border-primary px-6 font-sans text-sm"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-[10px] uppercase tracking-widest font-black text-stone-400 flex items-center gap-2"
                >
                  <Lock size={12} /> Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-2xl border-stone-100 bg-stone-50 h-14 focus:ring-primary focus:border-primary px-6 font-sans text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-white rounded-full font-sans uppercase tracking-[0.3em] text-[10px] font-black hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Entrar no Painel
              </Button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[10px] font-sans text-stone-300 uppercase tracking-widest font-bold leading-loose">
                Acesso exclusivo para administradores.
                <br />
                Solicite permissão ao suporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
