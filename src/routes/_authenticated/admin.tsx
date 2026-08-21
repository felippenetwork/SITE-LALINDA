import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, saveProduct, deleteProduct, getLeads, BreadItem } from "@/lib/catalog-data.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, LayoutDashboard, Settings, MessageSquare, LogOut, ExternalLink, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/sections/AdminSidebar";
import { LeadsTable } from "@/components/sections/LeadsTable";
import { ProductForm } from "@/components/forms/ProductForm";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo | La Linda" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BreadItem | null>(null);
  const [activeTab, setActiveTab] = useState<'produtos' | 'leads'>('produtos');

  const getLeadsFn = useServerFn(getLeads);
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => getLeadsFn(),
    enabled: activeTab === 'leads'
  });

  const fetchProductsFn = useServerFn(getProducts);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProductsFn()
  });

  const saveProductMutation = useMutation({
    mutationFn: useServerFn(saveProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editingItem ? "Produto atualizado" : "Novo produto adicionado");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar: " + error.message);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: useServerFn(deleteProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto removido com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir: " + error.message);
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    saveProductMutation.mutate({
      data: {
        id: editingItem?.id,
        name: formData.get("name") as string,
        category: formData.get("category") as any,
        weight: formData.get("weight") as string,
        boxWeight: formData.get("boxWeight") as string,
        image_url: formData.get("image") as string,
        description: formData.get("description") as string,
        available: true,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      {/* Header Mobile */}
      <header className="lg:hidden bg-stone-950 text-white p-6 sticky top-0 z-50 flex items-center justify-between">
        <h1 className="text-xl font-serif italic text-white leading-none">La Linda Admin</h1>
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 text-white hover:text-primary transition-colors">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-stone-950 border-stone-800 text-white p-8 flex flex-col w-full max-w-[300px]">
            <div className="mb-12">
              <h1 className="text-2xl font-serif italic text-white leading-none">La Linda</h1>
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-primary mt-2 block">Dashboard</span>
            </div>
            <nav className="flex-1 space-y-4">
              <SheetClose asChild>
                <button 
                  onClick={() => setActiveTab('produtos')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-left ${activeTab === 'produtos' ? 'bg-primary/10 text-primary' : 'text-stone-500 hover:text-white hover:bg-white/5'}`}
                >
                  <LayoutDashboard size={18} />
                  <span className="text-sm uppercase tracking-widest">Produtos</span>
                </button>
              </SheetClose>
              <SheetClose asChild>
                <button 
                  onClick={() => setActiveTab('leads')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-left ${activeTab === 'leads' ? 'bg-primary/10 text-primary' : 'text-stone-500 hover:text-white hover:bg-white/5'}`}
                >
                  <MessageSquare size={18} />
                  <span className="text-sm uppercase tracking-widest">Leads</span>
                </button>
              </SheetClose>
              <SheetClose asChild>
                <button className="w-full flex items-center gap-4 px-4 py-3 text-stone-500 hover:text-white hover:bg-white/5 rounded-xl font-bold text-left">
                  <Settings size={18} />
                  <span className="text-sm uppercase tracking-widest">Config</span>
                </button>
              </SheetClose>
            </nav>
            <div className="mt-auto pt-8 border-t border-stone-800 space-y-4">
              <Link to="/" className="flex items-center gap-4 px-4 py-2 text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-black">
                <ExternalLink size={14} /> Site Público
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold text-left">
                <LogOut size={18} />
                <span className="text-sm uppercase tracking-widest">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 lg:p-16">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 lg:mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif italic text-stone-900 mb-2">
              {activeTab === 'produtos' ? 'Produtos Cadastrados' : 'Leads e Contatos'}
            </h2>
            <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide">
              {activeTab === 'produtos' ? 'Gestão do catálogo artesanal La Linda' : 'Novas oportunidades de negócio'}
            </p>
          </div>
          
          {activeTab === 'produtos' && (
            <Dialog open={isDialogOpen || !!editingItem} onOpenChange={(open) => { if(!open) { setIsDialogOpen(false); setEditingItem(null); } }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto bg-primary hover:scale-105 transition-transform text-white font-black px-8 py-6 rounded-full text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 h-auto">
                  <Plus size={16} className="mr-2" /> Novo Produto
                </Button>
              </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[1.5rem] sm:rounded-[2rem] border-stone-100 p-6 sm:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-serif italic">{editingItem ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              </DialogHeader>
              <ProductForm 
                editingItem={editingItem} 
                onSubmit={handleSave} 
                isPending={saveProductMutation.isPending} 
              />
            </DialogContent>
          </Dialog>
          )}
        </div>

        {activeTab === 'produtos' ? (
          <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
              <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
                Coleção Atual — {products.length} Itens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-100 hover:bg-transparent">
                    <TableHead className="w-[100px] pl-8 py-6 text-[10px] uppercase tracking-widest font-black">Visual</TableHead>
                    <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">Produto</TableHead>
                    <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">Categoria</TableHead>
                    <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">Peso/Caixa</TableHead>
                    <TableHead className="py-6 text-[10px] uppercase tracking-widest font-black">Status</TableHead>
                    <TableHead className="text-right pr-8 py-6 text-[10px] uppercase tracking-widest font-black">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((item: any) => (
                    <TableRow key={String(item.id)} className="border-stone-50 hover:bg-stone-50/50 transition-colors group">
                      <TableCell className="pl-4 md:pl-8 py-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-stone-100 group-hover:scale-110 transition-transform">
                          <img src={item.image} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                        </div>
                      </TableCell>
                      <TableCell className="font-serif italic text-lg text-stone-900">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black border-stone-200 text-stone-400 rounded-full px-3">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-sans text-sm text-stone-500">
                        {item.weight} / <span className="text-stone-300">{item.boxWeight || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                          <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">
                            {item.available ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8 space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)} className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg hover:text-primary transition-all">
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={deleteProductMutation.isPending}
                          onClick={() => {
                            if(confirm("Deseja realmente excluir este produto?")) {
                              deleteProductMutation.mutate({ data: item.id });
                            }
                          }}
                          className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          {deleteProductMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-stone-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-stone-50/50 border-b border-stone-100 p-6 md:p-8">
              <CardTitle className="text-[10px] md:text-sm font-sans uppercase tracking-[0.2em] font-black text-stone-500">
                Oportunidades — {leads.length} Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <LeadsTable leads={leads} isLoading={leadsLoading} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
