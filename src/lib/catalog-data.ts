export interface BreadItem {
  id: string;
  name: string;
  weight: string;
  boxWeight?: string;
  image: string;
  category: string;
  description?: string;
  available: boolean;
}

export const INITIAL_CATALOG: BreadItem[] = [
  {
    id: "1",
    name: "Pão Francês",
    weight: "50g",
    boxWeight: "5kg",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800&auto=format&fit=crop",
    category: "Tradicionais",
    available: true,
  },
  {
    id: "2",
    name: "Pão de Forma",
    weight: "400g",
    boxWeight: "4kg",
    image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=800&auto=format&fit=crop",
    category: "Tradicionais",
    available: true,
  },
  {
    id: "3",
    name: "Pão de Hambúrguer",
    weight: "80g",
    boxWeight: "8kg",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop",
    category: "Tradicionais",
    available: true,
  },
  {
    id: "4",
    name: "Levain Clássico",
    weight: "500g",
    boxWeight: "5kg",
    image: "https://images.unsplash.com/photo-1585478259715-876a6a81bce8?q=80&w=800&auto=format&fit=crop",
    category: "Linha Premium",
    available: true,
  },
  {
    id: "5",
    name: "Multigreãos",
    weight: "500g",
    boxWeight: "5kg",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    category: "Linha Premium",
    available: true,
  },
  {
    id: "6",
    name: "Integral 100%",
    weight: "500g",
    boxWeight: "5kg",
    image: "https://images.unsplash.com/photo-1533777857417-3be94a9d259c?q=80&w=800&auto=format&fit=crop",
    category: "Linha Premium",
    available: true,
  },
  {
    id: "7",
    name: "Croissant de Manteiga",
    weight: "70g",
    boxWeight: "2kg",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
    category: "Confeitaria",
    available: true,
  },
  {
    id: "8",
    name: "Bolo de Cenoura",
    weight: "600g",
    boxWeight: "6kg",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=800&auto=format&fit=crop",
    category: "Confeitaria",
    available: true,
  },
  {
    id: "9",
    name: "Pão de Queijo",
    weight: "25g",
    boxWeight: "2kg",
    image: "https://images.unsplash.com/photo-1599330290433-d82292701bb0?q=80&w=800&auto=format&fit=crop",
    category: "Salgados",
    available: true,
  },
  {
    id: "10",
    name: "Super Doce Especial",
    weight: "150g",
    boxWeight: "3kg",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    category: "Confeitaria",
    available: true,
  }
];

export const TIMELINE_EVENTS = [
  {
    year: "1998",
    title: "A Primeira Fornada",
    description: "Início das atividades em uma pequena cozinha familiar, com a receita secreta da nonna.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop"
  },
  {
    year: "2005",
    title: "Expansão da Produção",
    description: "Inauguração da primeira sede industrial, ampliando a capacidade para atender toda a região.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&auto=format&fit=crop"
  },
  {
    year: "2012",
    title: "Frota Própria",
    description: "Aquisição dos primeiros caminhões para garantir a entrega de pães sempre frescos.",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=400&auto=format&fit=crop"
  },
  {
    year: "2020",
    title: "Inovação Digital",
    description: "Lançamento do portal de pedidos online para revendedores e parceiros.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop"
  },
  {
    year: "2026",
    title: "La Linda Hoje",
    description: "Referência em panificação artesanal e industrial, unindo tradição e tecnologia.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop"
  }
];

export const PRODUCT_LINES = [
  { name: "Tradicionais", icon: "🥖", category: "Tradicionais" },
  { name: "Linha Extra", icon: "🍞", category: "Linha Extra" },
  { name: "Linha Premium", icon: "💎", category: "Linha Premium" },
  { name: "Confeitaria", icon: "🧁", category: "Confeitaria" },
  { name: "Salgados", icon: "🥟", category: "Salgados" },
  { name: "Pão de Queijo", icon: "🧀", category: "Salgados" }
];

