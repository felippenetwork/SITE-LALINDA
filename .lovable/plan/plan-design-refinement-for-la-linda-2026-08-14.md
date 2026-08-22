# Plan: Design Refinement for La Linda

Refine the UI/UX to move away from generic "AI-generated" aesthetics, focusing on craftsmanship, warmth, and high-end bakery branding.

## User Review Required

> [!IMPORTANT]
> The design will shift from a generic layout to a more boutique, high-end "artisan bakery" aesthetic.

- **Typography:** Should we use a more classic serif for headings (e.g., Cormorant Garamond) to emphasize the "hand-crafted" aspect, or stick to the current modern heavy sans-serif?
- **Color Palette:** The current "rose and white" is very clean. Should we introduce deeper, more "baked" tones (like terracotta, warm wheat, or dark charcoal) for better contrast?

## Proposed Changes

### 1. Visual Identity & Styles

- Update `src/styles.css` with a more sophisticated semantic color palette:
  - `primary`: A richer, slightly warmer rose/terracotta.
  - `background`: Soft cream/off-white (`#FCF9F7`) instead of pure white/flat rose-50.
  - `foreground`: Deep charcoal/coffee for better readability and class.
- Add Google Fonts link in `src/routes/__root.tsx` (e.g., 'Instrument Serif' for headings and 'Inter' for body).

### 2. Homepage Redesign (`src/routes/index.tsx`)

- **Hero Section:** Move away from centered text overlays. Use asymmetrical layouts with high-quality photography, overlapping text elements, and elegant call-to-actions.
- **Micro-interactions:** Add subtle parallax effects on scroll and custom transitions for carousels to feel more bespoke.
- **Grid Layouts:** Break the standard 3-column grid. Use varied card sizes (bento-style or editorial layout) for product lines and timeline events.
- **Section Dividers:** Replace flat borders with subtle organic textures or more intentional whitespace.

### 3. Product Detail & Navigation

- Refine the navigation bar with a thinner, more elegant profile and frosted glass effect.
- Update the "Saiba Mais" buttons to a more premium style (e.g., underline animations or pill shapes with subtle borders).

## Technical Details

- **Fonts:** Load 'Instrument Serif' (headings) and 'Work Sans' (body) via `<link>` in `src/routes/__root.tsx`.
- **Animations:** Use `framer-motion` for staggered entrance animations and smooth layout transitions.
- **Tailwind:** Utilize Tailwind v4's `@theme` variables for semantic consistency across all pages.
