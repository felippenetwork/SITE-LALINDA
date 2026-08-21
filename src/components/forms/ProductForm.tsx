import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { BreadItem } from "@/lib/catalog-data.functions";

interface ProductFormProps {
  editingItem: BreadItem | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

export const ProductForm = ({ editingItem, onSubmit, isPending }: ProductFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-black text-stone-400">Nome do Produto</Label>
        <Input id="name" name="name" defaultValue={editingItem?.name} required className="rounded-xl border-stone-100 bg-stone-50 focus:ring-primary h-12" />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-[10px] uppercase tracking-widest font-black text-stone-400">Categoria</Label>
          <select id="category" name="category" defaultValue={editingItem?.category} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 h-12 text-sm focus:ring-2 focus:ring-primary outline-none">
            <option value="Tradicionais">Tradicionais</option>
            <option value="Linha Extra">Linha Extra</option>
            <option value="Linha Premium">Linha Premium</option>
            <option value="Confeitaria">Confeitaria</option>
            <option value="Salgados">Salgados</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-[10px] uppercase tracking-widest font-black text-stone-400">Peso Unitário</Label>
          <Input id="weight" name="weight" defaultValue={editingItem?.weight} required placeholder="ex: 50g" className="rounded-xl border-stone-100 bg-stone-50 h-12" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="boxWeight" className="text-[10px] uppercase tracking-widest font-black text-stone-400">Peso Caixa</Label>
          <Input id="boxWeight" name="boxWeight" defaultValue={editingItem?.boxWeight || ''} placeholder="ex: 5kg" className="rounded-xl border-stone-100 bg-stone-50 h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image" className="text-[10px] uppercase tracking-widest font-black text-stone-400">URL Imagem</Label>
          <Input id="image" name="image" defaultValue={editingItem?.image} required className="rounded-xl border-stone-100 bg-stone-50 h-12" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-black text-stone-400">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={editingItem?.description || ''} className="rounded-xl border-stone-100 bg-stone-50 min-h-[100px]" />
      </div>

      <DialogFooter className="pt-6">
        <Button type="submit" disabled={isPending} className="w-full bg-primary text-white rounded-full py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto">
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {editingItem ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
      </DialogFooter>
    </form>
  );
};
