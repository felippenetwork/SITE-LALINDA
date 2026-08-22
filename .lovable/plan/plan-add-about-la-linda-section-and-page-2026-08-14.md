# Plan: Add "About La Linda" section and page

Add a dedicated section on the home page for a brief summary about La Linda and create a new page `/a-lalinda` for detailed information. Update the navigation menu to include a link to this new page.

## User Review Required

> [!IMPORTANT]
>
> - The new "A La Linda" page will be created as a new route.
> - The home page will feature a new section after the Hero to introduce the brand.

## Proposed Changes

### Navigation & Routing

- Update header in `src/routes/index.tsx` to include "A Lalinda" link.
- Update header in `src/routes/catalog.tsx` (if it exists) to include "A Lalinda" link.
- Create `src/routes/a-lalinda.tsx` with detailed brand story, mission, and values.

### Home Page Improvements

- Insert a "Sobre a La Linda" section in `src/routes/index.tsx` right after the Hero section.
- This section will include a brief history and a "Leia mais" button linking to `/a-lalinda`.

### Global Header

- Ensure the header is consistent across pages (Home, Catalog, Admin, and the new About page).

## Technical Details

- Use TanStack Router for the new `/a-lalinda` route.
- Maintain the "pink and white" color palette (rose-50, rose-500, etc.) for visual consistency.
- Use Tailwind CSS for the new layout sections.
