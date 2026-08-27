import { getSiteSettings } from "@/lib/data/site-settings";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "light" | "dark";
}

export const Footer = async ({ variant = "light" }: FooterProps) => {
  const isDark = variant === "dark";
  const { instagramUrl, facebookUrl } = await getSiteSettings();
  const hasSocials = Boolean(instagramUrl || facebookUrl);

  return (
    <footer
      className={cn(
        "py-16 md:py-20",
        isDark
          ? "bg-stone-900 text-stone-400 border-t border-white/5"
          : "bg-background text-stone-400 border-t border-stone-100",
      )}
    >
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <h3
            className={cn("text-3xl font-serif italic", isDark ? "text-white" : "text-foreground")}
          >
            La Linda
          </h3>

          {hasSocials && (
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-sans uppercase tracking-widest font-bold">
                Siga a La Linda nas redes sociais
              </span>
              <div className="flex items-center gap-3">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram da La Linda"
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                      isDark
                        ? "border border-white/10 text-white hover:bg-primary hover:border-primary"
                        : "bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    <InstagramIcon size={16} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook da La Linda"
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                      isDark
                        ? "border border-white/10 text-white hover:bg-primary hover:border-primary"
                        : "bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    <FacebookIcon size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-[10px] font-sans uppercase tracking-[0.5em] font-bold text-center md:text-left">
          &copy; 2026 La Linda Pães Especiais — Uma Herança Artesanal
        </p>
      </div>
    </footer>
  );
};
