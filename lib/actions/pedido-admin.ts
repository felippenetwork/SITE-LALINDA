"use server";

import { getFilaProducao } from "@/lib/data/pedido-admin";

// Thin RPC wrapper for the admin dashboard's useQuery — getFilaProducao
// itself still enforces the has_role check, this adds no extra trust.
export async function getFilaProducaoAction() {
  return getFilaProducao();
}
