"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { BreadItem } from "@/lib/data/products";
import type { ProductLine } from "@/lib/data/product-lines";
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/validation/product";

interface ProductFormProps {
  editingItem: BreadItem | null;
  lines: ProductLine[];
  onSubmit: (data: ProductFormValues) => void;
  isPending: boolean;
}

export const ProductForm = ({ editingItem, lines, onSubmit, isPending }: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: editingItem?.id,
      name: editingItem?.name ?? "",
      categoryId: editingItem?.categoryId ?? lines[0]?.id ?? "",
      weight: editingItem?.weight ?? "",
      boxWeight: editingItem?.boxWeight ?? "",
      image_url: editingItem?.image ?? "",
      description: editingItem?.description ?? "",
      available: editingItem?.available ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-[10px] uppercase tracking-widest font-black text-stone-400"
        >
          Nome do Produto
        </Label>
        <Input
          id="name"
          {...register("name")}
          className="rounded-xl border-stone-100 bg-stone-50 focus:ring-primary h-12"
        />
        {errors.name && <p className="text-[10px] text-rose-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="categoryId"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            Linha
          </Label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 h-12 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="weight"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            Peso Unitário
          </Label>
          <Input
            id="weight"
            {...register("weight")}
            placeholder="ex: 50g"
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.weight && <p className="text-[10px] text-rose-500">{errors.weight.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="boxWeight"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            Peso Caixa
          </Label>
          <Input
            id="boxWeight"
            {...register("boxWeight")}
            placeholder="ex: 5kg"
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="image_url"
            className="text-[10px] uppercase tracking-widest font-black text-stone-400"
          >
            URL Imagem
          </Label>
          <Input
            id="image_url"
            {...register("image_url")}
            className="rounded-xl border-stone-100 bg-stone-50 h-12"
          />
          {errors.image_url && (
            <p className="text-[10px] text-rose-500">{errors.image_url.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-[10px] uppercase tracking-widest font-black text-stone-400"
        >
          Descrição
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          className="rounded-xl border-stone-100 bg-stone-50 min-h-[100px]"
        />
      </div>

      <DialogFooter className="pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {editingItem ? "Salvar Alterações" : "Criar Produto"}
        </Button>
      </DialogFooter>
    </form>
  );
};
