"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

interface PriceCellProps {
  value: number | null;
  onSave: (value: number | null) => void;
  isSaving: boolean;
  className?: string;
}

// Clique -> vira input; Enter/blur salva; Esc cancela. valor null = célula
// vazia ("sem preço definido"), nunca renderizado como zero.
export const PriceCell = ({ value, onSave, isSaving, className }: PriceCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    setDraft(value !== null ? String(value) : "");
    setIsEditing(true);
  };

  const commit = () => {
    setIsEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (value !== null) onSave(null);
      return;
    }
    const parsed = Number(trimmed.replace(",", "."));
    if (Number.isNaN(parsed) || parsed <= 0) return;
    if (parsed !== value) onSave(parsed);
  };

  if (isSaving) {
    return (
      <div className={cn("flex items-center justify-center h-9 w-full", className)}>
        <Loader2 className="animate-spin text-primary" size={14} />
      </div>
    );
  }

  if (isEditing) {
    return (
      <Input
        type="text"
        inputMode="decimal"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setIsEditing(false);
          }
        }}
        className={cn(
          "h-9 w-28 rounded-lg border-border bg-background text-sm text-center",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={cn(
        "h-9 w-28 rounded-lg text-sm font-sans transition-colors flex items-center justify-center",
        value !== null
          ? "text-foreground hover:bg-accent"
          : "text-muted-foreground/50 hover:bg-accent hover:text-muted-foreground",
        className,
      )}
    >
      {value !== null ? formatBRL(value) : "—"}
    </button>
  );
};
