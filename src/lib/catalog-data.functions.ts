import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface BreadItem {
  id: string;
  name: string;
  weight: string;
  boxWeight?: string | null;
  image: string;
  category: string;
  description?: string | null;
  available: boolean;
}

export const getProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((p: any): BreadItem => ({
      id: p.id,
      name: p.name,
      weight: p.weight,
      boxWeight: p.box_weight,
      image: p.image_url,
      category: p.category,
      description: p.description,
      available: p.available ?? true,
    }));
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => 
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      weight: z.string().min(1),
      boxWeight: z.string().optional().nullable(),
      image_url: z.string().url(),
      category: z.enum(['Tradicionais', 'Linha Extra', 'Linha Premium', 'Confeitaria', 'Salgados']),
      description: z.string().optional().nullable(),
      available: z.boolean().default(true),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    
    // Role check
    const { data: hasRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' });
    
    if (roleError || !hasRole) {
      throw new Error("Forbidden: Admin role required");
    }

    if (data.id) {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          weight: data.weight,
          box_weight: data.boxWeight ?? null,
          image_url: data.image_url,
          category: data.category,
          description: data.description ?? null,
          available: data.available,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          weight: data.weight,
          box_weight: data.boxWeight ?? null,
          image_url: data.image_url,
          category: data.category,
          available: data.available,
          description: data.description ?? null,
        }]);
      if (error) throw error;
    }
    return { success: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id, context }) => {
    const { supabase, userId } = context;
    
    const { data: hasRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' });
    
    if (roleError || !hasRole) {
      throw new Error("Forbidden: Admin role required");
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  });

export const getTimelineEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const { data, error } = await supabaseAdmin
      .from('timeline_events')
      .select('*')
      .order('year', { ascending: true });

    if (error) throw error;

    return (data || []).map((e: any) => ({
      year: e.year,
      title: e.title,
      description: e.description,
      image: e.image_url
    }));
  });

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => 
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional().nullable(),
      interest: z.string().optional().nullable(),
      message: z.string().optional().nullable(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    const { error } = await supabaseAdmin
      .from('leads')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        interest: data.interest ?? null,
        message: data.message ?? null,
      }]);

    if (error) throw error;
    return { success: true };
  });

export const getLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    const { data: hasRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' });
    
    if (roleError || !hasRole) {
      throw new Error("Forbidden: Admin role required");
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

export const PRODUCT_LINES = [
  { name: "Tradicionais", icon: "🥖", category: "Tradicionais" },
  { name: "Linha Extra", icon: "🍞", category: "Linha Extra" },
  { name: "Linha Premium", icon: "💎", category: "Linha Premium" },
  { name: "Confeitaria", icon: "🧁", category: "Confeitaria" },
  { name: "Salgados", icon: "🥟", category: "Salgados" },
  { name: "Pão de Queijo", icon: "🧀", category: "Salgados" }
];