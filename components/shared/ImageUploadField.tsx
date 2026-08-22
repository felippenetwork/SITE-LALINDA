"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/actions/upload-image";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImageUploadFieldProps {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
}

export const ImageUploadField = ({ label, value, onChange }: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato não suportado. Use JPG, PNG, WEBP ou GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Imagem maior que 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const { url } = await uploadImage(formData);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">
        {label}
      </span>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-100 bg-stone-50 shrink-0">
          {value ? (
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <ImagePlus size={20} />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[10px] font-sans uppercase tracking-widest font-black text-stone-600 transition-colors disabled:opacity-50"
            >
              {isUploading ? "Enviando..." : value ? "Trocar Imagem" : "Enviar Imagem"}
            </button>
            {value && !isUploading && (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remover imagem"
                className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-[9px] text-stone-300 font-sans">JPG, PNG, WEBP ou GIF · até 5MB</p>
          {error && <p className="text-[10px] text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};
