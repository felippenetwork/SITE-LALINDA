-- Editable tracking IDs (Google Tag Manager container, Meta Pixel) so an
-- admin can paste them in /admin/config without a code deploy. No RLS/grant
-- changes needed — site_settings' existing public-select / admin-update
-- policies already cover these new columns (RLS is row-scoped, not
-- column-scoped).
alter table public.site_settings add column gtm_id text;
alter table public.site_settings add column meta_pixel_id text;
