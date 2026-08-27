import { getSiteSettings } from "@/lib/data/site-settings";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";

export const Footer = async () => {
  const { instagramUrl, facebookUrl } = await getSiteSettings();
  const hasSocials = Boolean(instagramUrl || facebookUrl);

  return (
    <footer className="py-12 md:py-16 bg-stone-900 text-stone-400 border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <h3 className="text-4xl md:text-5xl font-serif italic text-white">La Linda</h3>

          {hasSocials && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-sans uppercase tracking-widest font-bold">
                Siga a La Linda nas redes sociais
              </span>
              <div className="flex items-center gap-3">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram da La Linda"
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all"
                  >
                    <InstagramIcon size={22} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook da La Linda"
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all"
                  >
                    <FacebookIcon size={22} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs font-sans uppercase tracking-[0.25em] font-bold text-center md:text-left">
          &copy; 2026 La Linda Pães Especiais — Uma Herança Artesanal
        </p>
      </div>
    </footer>
  );
};
