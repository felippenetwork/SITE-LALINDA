"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Eye, EyeOff, Dices } from "lucide-react";
import { listAdmins, createAdmin, removeAdmin, type AdminUser } from "@/lib/actions/admins";
import type { PanelRole } from "@/lib/validation/admin";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<PanelRole, string> = {
  admin: "Administrador",
  operador: "Operador",
};

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
  const [role, setRole] = useState<PanelRole>("operador");
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
          ? "Usuário criado — já pode fazer login com o e-mail e senha definidos"
          : "Essa conta já existia — o papel foi concedido a ela",
      );
      setIsDialogOpen(false);
      setEmail("");
      setPassword("");
      setRole("operador");
      setShowPassword(false);
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar usuário: " + error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: PanelRole }) =>
      removeAdmin(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Acesso removido");
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
    createMutation.mutate({ email, password, role });
  };

  return (
    <Card className="rounded-[1.5rem] md:rounded-[2rem] border-stone-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
          Usuários do Painel
        </CardTitle>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="bg-primary hover:scale-105 transition-transform text-white rounded-full h-9 w-9 shadow-lg shadow-primary/20 shrink-0"
              aria-label="Novo usuário"
            >
              <Plus size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[460px] rounded-[1.5rem] sm:rounded-[2rem] border-stone-100 p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-serif italic">Novo Usuário</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-stone-400">
                  Nível de Acesso
                </Label>
                <div className="grid grid-cols-2 gap-2 bg-stone-50 border border-stone-100 rounded-xl p-1">
                  {(["operador", "admin"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={cn(
                        "rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                        role === option
                          ? "bg-primary text-white shadow-sm"
                          : "text-stone-500 hover:text-foreground",
                      )}
                    >
                      {ROLE_LABEL[option]}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  {role === "admin"
                    ? "Acesso total: catálogo, leads e configurações do site."
                    : "Acesso ao catálogo e aos leads. Sem acesso a configurações do site nem a criação de outros usuários."}
                </p>
              </div>

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
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
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
                <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">
                  Nível
                </TableHead>
                <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin: AdminUser) => (
                <TableRow
                  key={`${admin.userId}-${admin.role}`}
                  className="border-stone-50 hover:bg-stone-50/50 transition-colors group"
                >
                  <TableCell className="font-sans font-semibold text-sm text-stone-900">
                    <div className="flex items-center gap-3">
                      {admin.email}
                      {admin.isSelf && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                          Você
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                        admin.role === "admin"
                          ? "text-stone-700 bg-stone-100"
                          : "text-stone-500 bg-stone-50 border border-stone-100",
                      )}
                    >
                      {ROLE_LABEL[admin.role]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={admin.isSelf || removeMutation.isPending}
                      title={admin.isSelf ? "Você não pode remover seu próprio acesso" : "Remover"}
                      onClick={() => {
                        if (confirm(`Deseja realmente remover o acesso de "${admin.email}"?`)) {
                          removeMutation.mutate({ userId: admin.userId, role: admin.role });
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
      </CardContent>
    </Card>
  );
};
