-- Create enum for product categories
CREATE TYPE public.product_category AS ENUM (
  'Tradicionais', 
  'Linha Extra', 
  'Linha Premium', 
  'Confeitaria', 
  'Salgados'
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  weight TEXT NOT NULL,
  box_weight TEXT,
  image_url TEXT NOT NULL,
  category public.product_category NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create timeline_events table
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create leads table for contact form
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT ON public.timeline_events TO anon, authenticated;
GRANT ALL ON public.timeline_events TO service_role;

GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

-- Policies
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated full access on products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public read on timeline_events" ON public.timeline_events FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Seed Initial Products
INSERT INTO public.products (name, weight, box_weight, image_url, category, available) VALUES
('Pão Francês', '50g', '5kg', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800', 'Tradicionais', true),
('Pão de Forma', '400g', '4kg', 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=800', 'Tradicionais', true),
('Pão de Hambúrguer', '80g', '8kg', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800', 'Tradicionais', true),
('Levain Clássico', '500g', '5kg', 'https://images.unsplash.com/photo-1585478259715-876a6a81bce8?q=80&w=800', 'Linha Premium', true),
('Multigreãos', '500g', '5kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800', 'Linha Premium', true),
('Integral 100%', '500g', '5kg', 'https://images.unsplash.com/photo-1533777857417-3be94a9d259c?q=80&w=800', 'Linha Premium', true),
('Croissant de Manteiga', '70g', '2kg', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800', 'Confeitaria', true),
('Bolo de Cenoura', '600g', '6kg', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=800', 'Confeitaria', true),
('Pão de Queijo', '25g', '2kg', 'https://images.unsplash.com/photo-1599330290433-d82292701bb0?q=80&w=800', 'Salgados', true),
('Super Doce Especial', '150g', '3kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800', 'Confeitaria', true);

-- Seed Timeline
INSERT INTO public.timeline_events (year, title, description, image_url) VALUES
('1998', 'A Primeira Fornada', 'Início das atividades em uma pequena cozinha familiar, com a receita secreta da nonna.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400'),
('2005', 'Expansão da Produção', 'Inauguração da primeira sede industrial, ampliando a capacidade para atender toda a região.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400'),
('2012', 'Frota Própria', 'Aquisição dos primeiros caminhões para garantir a entrega de pães sempre frescos.', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=400'),
('2020', 'Inovação Digital', 'Lançamento do portal de pedidos online para revendedores e parceiros.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400'),
('2026', 'La Linda Hoje', 'Referência em panificação artesanal e industrial, unindo tradição e tecnologia.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400');