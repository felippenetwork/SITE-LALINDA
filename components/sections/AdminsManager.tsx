"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Eye, EyeOff, Dices } from "lucide-react";
import { listAdmins, createAdmin, removeAdmin } from "@/lib/actions/admins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

function generateSecurePassword() {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => charset[n % charset.length]).join("");
}

export const AdminsManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: listAdmins,
  });

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success(
        result.granted === "created"
          ? "Administrador criado — já pode fazer login com o e-mail e senha definidos"
          : "Essa conta já existia — o papel de administrador foi concedido a ela",
      );
      setIsDialogOpen(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar administrador: " + error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Acesso de administrador removido");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  const handleCreate = () => {
    if (password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres");
      return;
    }
    createMutation.mutate({ email, password });
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:scale-105 transition-transform text-white font-black px-8 py-6 rounded-full text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto">
              <Plus size={16} className="mr-2" /> Novo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[460px] rounded-[1.5rem] sm:rounded-[2rem] border-stone-100 p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-serif italic">Novo Administrador</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="admin-email"
                  className="text-[10px] uppercase tracking-widest font-black text-stone-400"
                >
                  E-mail
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-stone-100 bg-stone-50 h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="admin-password"
                    className="text-[10px] uppercase tracking-widest font-black text-stone-400"
                  >
                    Senha
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setPassword(generateSecurePassword());
                      setShowPassword(true);
                    }}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-primary hover:text-primary/80 transition-colors"
                  >
                    <Dices size={12} /> Gerar senha segura
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-stone-100 bg-stone-50 h-12 pr-12 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  Anote essa senha e compartilhe com a pessoa por um canal seguro — ela não fica
                  visível novamente depois de criada.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-6">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !email || !password}
                className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
              >
                {createMutation.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : null}
                Criar Administrador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-stone-100 hover:bg-transparent">
              <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                E-mail
              </TableHead>
              <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow
                key={admin.userId}
                className="border-stone-50 hover:bg-stone-50/50 transition-colors group"
              >
                <TableCell className="font-sans text-sm text-stone-900 flex items-center gap-3">
                  {admin.email}
                  {admin.isSelf && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Você
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={admin.isSelf || removeMutation.isPending}
                    title={
                      admin.isSelf
                        ? "Você não pode remover seu próprio acesso"
                        : "Remover administrador"
                    }
                    onClick={() => {
                      if (
                        confirm(
                          `Deseja realmente remover o acesso de administrador de "${admin.email}"?`,
                        )
                      ) {
                        removeMutation.mutate(admin.userId);
                      }
                    }}
                    className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};
