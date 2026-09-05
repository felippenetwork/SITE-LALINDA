"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Lock, Mail } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "cadastro" | "login";

export function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("cadastro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      toast.error("Login com Google indisponível no momento — use e-mail e senha.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      if (mode === "cadastro") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(
            error.message === "User already registered"
              ? "Este e-mail já tem uma conta — tente entrar."
              : error.message,
          );
          return;
        }
        if (!data.session) {
          toast.error("Não foi possível criar sua conta. Tente novamente.");
          return;
        }
        router.push("/portal/completar-cadastro");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(
            error.message === "Invalid login credentials" ? "Credenciais inválidas" : error.message,
          );
          return;
        }
        router.push("/portal");
        router.refresh();
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/portal/callback` },
      });
      if (error) {
        toast.error("Não foi possível iniciar o login com Google.");
        setIsGoogleLoading(false);
      }
      // Em caso de sucesso o navegador já está sendo redirecionado — não
      // há necessidade (nem estado local confiável) de desligar o loading.
    } catch {
      toast.error("Não foi possível iniciar o login com Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 font-serif selection:bg-primary selection:text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-4 text-muted-foreground font-sans uppercase tracking-widest text-[8px] md:text-[10px] font-black mb-8 md:mb-12 hover:text-foreground transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        ao Início
      </Link>

      <div className="w-full max-w-[450px]">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl italic text-foreground mb-4 leading-none">
            La Linda
          </h1>
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-primary block">
            Área do Cliente
          </span>
        </div>

        <Card className="rounded-[2rem] md:rounded-[3rem] border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-background/50 border-b border-border p-6 md:p-10 text-center">
            <CardTitle className="text-xl md:text-2xl italic text-foreground">
              {mode === "cadastro" ? "Criar Conta" : "Entrar"}
            </CardTitle>
            <CardDescription className="font-sans text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest mt-2 font-bold">
              Compras B2B para o seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <Button
              type="button"
              onClick={handleGoogle}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full h-14 rounded-2xl border-border font-sans text-sm font-semibold gap-3 mb-6"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <GoogleIcon size={18} />
              )}
              Continuar com Google
            </Button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground font-bold">
                ou
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2"
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
                  className="rounded-2xl border-border bg-background h-14 focus:ring-primary focus:border-primary px-6 font-sans text-sm"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2"
                >
                  <Lock size={12} /> Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "cadastro" ? 8 : undefined}
                  className="rounded-2xl border-border bg-background h-14 focus:ring-primary focus:border-primary px-6 font-sans text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-white rounded-full font-sans uppercase tracking-[0.3em] text-[10px] font-black hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {mode === "cadastro" ? "Criar Conta" : "Entrar"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "cadastro" ? "login" : "cadastro")}
                className={cn(
                  "text-[10px] font-sans uppercase tracking-widest font-black text-muted-foreground hover:text-primary transition-colors",
                )}
              >
                {mode === "cadastro" ? "Já tem conta? Entrar" : "Ainda não tem conta? Criar"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
