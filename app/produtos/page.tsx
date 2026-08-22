import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { ProdutosClient } from "./ProdutosClient";

export const metadata: Metadata = {
  title: "Nossas Linhas de Produtos | La Linda Pães Especiais",
  description: "Conheça nossas linhas: Tradicional, Fermentação Natural, Confeitaria e muito mais.",
  openGraph: {
    title: "Nossas Linhas de Produtos | La Linda Pães Especiais",
    description:
      "Conheça nossas linhas: Tradicional, Fermentação Natural, Confeitaria e muito mais.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function ProdutosPage() {
  const products = await getProducts();
  return <ProdutosClient products={products} />;
}
