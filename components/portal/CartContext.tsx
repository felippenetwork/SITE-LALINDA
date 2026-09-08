"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const DEFAULT_STORAGE_KEY = "lalinda-portal-carrinho";

export interface CartItem {
  produtoId: string;
  nome: string;
  quantidade: number;
}

interface CartContextValue {
  itens: CartItem[];
  adicionarItem: (produtoId: string, nome: string, quantidade: number) => void;
  removerItem: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// Carrinho guarda só produtoId/nome/quantidade — nunca preço. Preço é
// sempre resolvido ao vivo em quem exibe (catálogo, checkout), pra nunca
// mostrar um valor que ficou desatualizado entre adicionar e finalizar.
//
// storageKey é opcional (default = carrinho do portal) — a área /vendas
// usa uma chave própria ("lalinda-vendas-carrinho") pra nunca colidir com
// o carrinho de um cliente de verdade, caso as duas sessões por acaso
// rodem no mesmo navegador.
export function CartProvider({
  children,
  storageKey = DEFAULT_STORAGE_KEY,
}: {
  children: ReactNode;
  storageKey?: string;
}) {
  const [itens, setItens] = useState<CartItem[]>([]);

  // Hidrata do localStorage só depois do mount — bridging com sistema
  // externo. setState fica dentro do callback assíncrono (não direto no
  // corpo do efeito) pelo mesmo motivo do reset de Counter.tsx: o
  // react-hooks/set-state-in-effect do React Compiler não permite
  // setState síncrono direto no corpo do efeito.
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) setItens(JSON.parse(raw));
      } catch {
        // localStorage indisponível (aba privada, etc.) — carrinho só não persiste.
      }
    });
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(itens));
    } catch {
      // idem acima — falha silenciosa, carrinho continua funcionando em memória.
    }
  }, [storageKey, itens]);

  const adicionarItem = (produtoId: string, nome: string, quantidade: number) => {
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === produtoId);
      if (existente) {
        return atual.map((i) =>
          i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + quantidade } : i,
        );
      }
      return [...atual, { produtoId, nome, quantidade }];
    });
  };

  const removerItem = (produtoId: string) => {
    setItens((atual) => atual.filter((i) => i.produtoId !== produtoId));
  };

  const atualizarQuantidade = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    setItens((atual) => atual.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i)));
  };

  const limparCarrinho = () => setItens([]);

  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ itens, adicionarItem, removerItem, atualizarQuantidade, limparCarrinho, totalItens }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de um CartProvider");
  return context;
}
