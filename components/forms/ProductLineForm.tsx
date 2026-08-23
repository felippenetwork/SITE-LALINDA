"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import type { ProductLine } from "@/lib/data/product-lines";
import {
  productLineSchema,
  type ProductLineInput,
  type ProductLineValues,
} from "@/lib/validation/product-line";

interface ProductLineFormProps {
  editingLine: ProductLine | null;
  onSubmit: (data: ProductLineValues) => void;
  isPending: boolean;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ProductLineForm = ({ editingLine, onSubmit, isPending }: ProductLineFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductLineInput, unknown, ProductLineValues>({
    resolver: zodResolver(productLineSchema),
    defaultValues: {
      id: editingLine?.id,
      name: editingLine?.name ?? "",
      slug: editingLine?.slug ?? "",
      description: editingLine?.description ?? "",
      image_url: editingLine?.image ?? "",
      available: editingLine?.available ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-[10px] uppercase tracking-widest font-black text-stone-400"
        >
          Nome da Linha
        </Label>
        <Input
          id="name"
          {...register("name", {
            onChange: (e) => {
              if (!editingLine) setValue("slug", slugify(e.target.value));
            },
          })}
          className="rounded-xl border-stone-100 bg-stone-50 focus:ring-primary h-12"
        />
        {errors.name && <p className="text-[10px] text-rose-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="slug"
          className="text-[10px] uppercase tracking-widest font-black text-stone-400"
        >
          Slug (usado na URL)
        </Label>
        <Input
          id="slug"
          {...register("slug")}
          placeholder="ex: linha-premium"
          className="rounded-xl border-stone-100 bg-stone-50 h-12 font-mono text-sm"
        />
        {errors.slug && <p className="text-[10px] text-rose-500">{errors.slug.message}</p>}
      </div>

      <ImageUploadField
        label="Foto da Linha"
        value={watch("image_url")}
        onChange={(url) => setValue("image_url", url, { shouldValidate: true })}
      />
      {errors.image_url && <p className="text-[10px] text-rose-500">{errors.image_url.message}</p>}

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
          {editingLine ? "Salvar Alterações" : "Criar Linha"}
        </Button>
      </DialogFooter>
    </form>
  );
};
