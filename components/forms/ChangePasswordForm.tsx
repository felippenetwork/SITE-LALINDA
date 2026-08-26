"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("A nova senha precisa ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsPending(true);
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Não foi possível identificar o usuário logado");
        return;
      }

      // Re-verify the current password before allowing the change — Supabase's
      // updateUser() doesn't require it since the session is already valid, but
      // skipping this would let a hijacked/unattended session silently take
      // over the account.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) {
        toast.error("Senha atual incorreta");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        toast.error("Erro ao trocar senha: " + updateError.message);
        return;
      }

      // Sign out any other active sessions/devices now that the password changed.
      await supabase.auth.signOut({ scope: "others" });

      toast.success("Senha atualizada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Erro inesperado ao trocar senha");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label
          htmlFor="currentPassword"
          className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2"
        >
          <Lock size={12} /> Senha Atual
        </Label>
        <Input
          id="currentPassword"
          type={showPasswords ? "text" : "password"}
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="rounded-xl border-stone-100 bg-stone-50 h-12"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="newPassword"
            className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground"
          >
            Nova Senha
          </Label>
          <Input
            id="newPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground"
          >
            Confirmar Nova Senha
          </Label>
          <Input
            id="confirmPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
        </button>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white rounded-full px-8 py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          Trocar Senha
        </Button>
      </div>
    </form>
  );
};
