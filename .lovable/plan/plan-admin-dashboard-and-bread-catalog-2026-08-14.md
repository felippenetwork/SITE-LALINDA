# Plan - Admin Dashboard and Bread Catalog

Add a professional administration dashboard at `/admin` for managing the catalog, bakery details, and photos. Additionally, create a dedicated `/catalog` route for a full-screen, searchable menu of all bread products.

## User Review Required

> [!IMPORTANT]
> The admin dashboard will initially use mock data. To make it functional (saving changes), Lovable Cloud must be enabled for database persistence.

## Proposed Changes

### Routing & Navigation

- Create `src/routes/admin.tsx` for the admin dashboard.
- Create `src/routes/catalog.tsx` for the full product menu.
- Update `src/routes/index.tsx` to link to the new `/catalog` route in the header and hero sections.
- Update `src/routes/__root.tsx` if global navigation needs adjustments (though header is currently local to index).

### Admin Dashboard (`/admin`)

- **Dashboard Overview**: Summary of catalog items and recent activity.
- **Catalog Management**: CRUD (Create, Read, Update, Delete) interface for bread products.
- **Bakery Info**: Edit bakery name, slogan, and contact information.
- **Media Gallery**: Manage product photos.
- **Professional UI**: Clean, sidebar-driven layout with status indicators.

### Catalog Menu (`/catalog`)

- **Category Filter**: Easy navigation between Traditional, Sourdough, and Confectionery.
- **Search Functionality**: Quick search for specific products.
- **Detailed Cards**: High-quality images, weights, and descriptions for every product.
- **Sticky Navigation**: Category tabs for quick jumping.

## Technical Details

- **State Management**: Use `useState` and local constants for initial mock data.
- **UI Components**: Use Radix-based components (Dialog, Tabs, etc.) via shadcn patterns for the admin UI.
- **Animations**: Framer Motion or Tailwind transitions for smooth navigation.
- **SEO**: Unique head metadata for both new routes.
