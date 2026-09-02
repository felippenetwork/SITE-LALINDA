"use client";

import { createContext, useContext, type ReactNode } from "react";

// app/admin/layout.tsx already computes isAdmin server-side (for the
// sidebar's Config/Preços links) — this just makes that same value
// reachable from client components nested anywhere under the admin
// shell, e.g. to hide the "Ver Preços" button from Operador in
// ClientesManager without a second role check.
const AdminRoleContext = createContext(false);

export function AdminRoleProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  return <AdminRoleContext.Provider value={isAdmin}>{children}</AdminRoleContext.Provider>;
}

export function useIsAdmin() {
  return useContext(AdminRoleContext);
}
