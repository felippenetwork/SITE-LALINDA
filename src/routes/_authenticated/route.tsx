import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

export const Route = createFileRoute('/_authenticated')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
