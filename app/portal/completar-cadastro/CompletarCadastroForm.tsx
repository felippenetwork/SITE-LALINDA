"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { completarCadastro } from "@/lib/actions/portal";
import {
  completarCadastroSchema,
  type CompletarCadastroInput,
  type CompletarCadastroValues,
} from "@/lib/validation/completar-cadastro";
import { cn } from "@/lib/utils";

export function CompletarCadastroForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompletarCadastroInput, unknown, CompletarCadastroValues>({
    resolver: zodResolver(completarCadastroSchema),
    defaultValues: {
      tipo_documento: "cnpj",
      documento: "",
      razao_social: "",
      inscricao_estadual: "",
      contato_nome: "",
      telefone: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
    },
  });

  const tipoDocumento = watch("tipo_documento") ?? "cnpj";

  const onSubmit = async (data: CompletarCadastroValues) => {
    setIsSubmitting(true);
    try {
      const result = await completarCadastro(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Cadastro enviado para aprovação!");
      router.push("/portal");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar cadastro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-[2rem] md:rounded-[3rem] border-border shadow-sm overflow-hidden">
      <CardContent className="p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Tipo de Documento
              </Label>
              <div className="grid grid-cols-2 gap-2 bg-background border border-border rounded-xl p-1">
                {(["cnpj", "cpf"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setValue("tipo_documento", option, { shouldValidate: true });
                      if (option === "cpf") {
                        setValue("contato_nome", watch("razao_social"), { shouldValidate: true });
                      }
                    }}
                    className={cn(
                      "rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                      tipoDocumento === option
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option === "cnpj" ? "Empresa (CNPJ)" : "Pessoa Física (CPF)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                {tipoDocumento === "cpf" ? "Nome Completo" : "Razão Social"}
              </Label>
              <Input
                {...register("razao_social", {
                  onChange: (e) => {
                    if (tipoDocumento === "cpf") setValue("contato_nome", e.target.value);
                  },
                })}
                className="rounded-xl border-border bg-background h-12"
              />
              {errors.razao_social && (
                <p className="text-[10px] text-rose-500">{errors.razao_social.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                {tipoDocumento === "cpf" ? "CPF" : "CNPJ"}
              </Label>
              <Input
                {...register("documento")}
                placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                className="rounded-xl border-border bg-background h-12"
              />
              {errors.documento && (
                <p className="text-[10px] text-rose-500">{errors.documento.message}</p>
              )}
            </div>

            {tipoDocumento === "cnpj" && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  Inscrição Estadual
                </Label>
                <Input
                  {...register("inscricao_estadual")}
                  className="rounded-xl border-border bg-background h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Telefone
              </Label>
              <Input
                {...register("telefone")}
                className="rounded-xl border-border bg-background h-12"
              />
              {errors.telefone && (
                <p className="text-[10px] text-rose-500">{errors.telefone.message}</p>
              )}
            </div>

            {tipoDocumento === "cnpj" && (
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  Nome do Contato
                </Label>
                <Input
                  {...register("contato_nome")}
                  className="rounded-xl border-border bg-background h-12"
                />
                {errors.contato_nome && (
                  <p className="text-[10px] text-rose-500">{errors.contato_nome.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Logradouro
              </Label>
              <Input
                {...register("logradouro")}
                className="rounded-xl border-border bg-background h-12"
              />
              {errors.logradouro && (
                <p className="text-[10px] text-rose-500">{errors.logradouro.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Número
              </Label>
              <Input
                {...register("numero")}
                className="rounded-xl border-border bg-background h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Bairro
              </Label>
              <Input
                {...register("bairro")}
                className="rounded-xl border-border bg-background h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Cidade
              </Label>
              <Input
                {...register("cidade")}
                className="rounded-xl border-border bg-background h-12"
              />
              {errors.cidade && (
                <p className="text-[10px] text-rose-500">{errors.cidade.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  UF
                </Label>
                <Input
                  {...register("uf")}
                  maxLength={2}
                  placeholder="SP"
                  className="rounded-xl border-border bg-background h-12 uppercase"
                />
                {errors.uf && <p className="text-[10px] text-rose-500">{errors.uf.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  CEP
                </Label>
                <Input
                  {...register("cep")}
                  placeholder="00000-000"
                  className="rounded-xl border-border bg-background h-12"
                />
                {errors.cep && <p className="text-[10px] text-rose-500">{errors.cep.message}</p>}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Completar Cadastro
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
