"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
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
  defaultCategoryId?: string;
}

export const ProductForm = ({
  editingItem,
  lines,
  onSubmit,
  isPending,
  defaultCategoryId,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: editingItem?.id,
      name: editingItem?.name ?? "",
      categoryId: editingItem?.categoryId ?? defaultCategoryId ?? lines[0]?.id ?? "",
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
          className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
        >
          Nome do Produto
        </Label>
        <Input
          id="name"
          {...register("name")}
          className="rounded-xl border-border bg-background focus:ring-primary h-12"
        />
        {errors.name && <p className="text-[10px] text-rose-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="categoryId"
            className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
          >
            Linha
          </Label>
          <Select
            value={watch("categoryId")}
            onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
          >
            <SelectTrigger id="categoryId" className="rounded-xl border-border bg-background h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lines.map((line) => (
                <SelectItem key={line.id} value={line.id}>
                  {line.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="weight"
            className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
          >
            Peso Unitário
          </Label>
          <Input
            id="weight"
            {...register("weight")}
            placeholder="ex: 50g"
            className="rounded-xl border-border bg-background h-12"
          />
          {errors.weight && <p className="text-[10px] text-rose-500">{errors.weight.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="boxWeight"
          className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
        >
          Peso Caixa
        </Label>
        <Input
          id="boxWeight"
          {...register("boxWeight")}
          placeholder="ex: 5kg"
          className="rounded-xl border-border bg-background h-12"
        />
      </div>

      <ImageUploadField
        label="Foto do Produto"
        value={watch("image_url")}
        onChange={(url) => setValue("image_url", url, { shouldValidate: true })}
      />
      {errors.image_url && <p className="text-[10px] text-rose-500">{errors.image_url.message}</p>}

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
        >
          Descrição
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          className="rounded-xl border-border bg-background min-h-[100px]"
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
