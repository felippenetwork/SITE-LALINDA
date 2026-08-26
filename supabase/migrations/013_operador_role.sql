-- Second admin-panel access tier: Operador (catálogo + leads only).
-- Reuses the 'moderator' enum value, unused anywhere in the codebase
-- until now, renamed to match the actual business term.
alter type public.app_role rename value 'moderator' to 'operador';

-- Broaden admin-only write policies to admin OR operador for the two
-- areas Operador manages: catálogo (lines, products, their images) and
-- leads. user_roles, site_settings, and audit_logs stay admin-only —
-- untouched.

alter policy "Admins can manage products" on public.products
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'))
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

alter policy "Allow admin insert on product_lines" on public.product_lines
with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

alter policy "Allow admin update on product_lines" on public.product_lines
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

alter policy "Allow admin delete on product_lines" on public.product_lines
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

alter policy "Admins can select leads" on public.leads
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

alter policy "Admins can delete leads" on public.leads
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador'));

alter policy "Admins can upload to product-images" on storage.objects
with check (bucket_id = 'product-images' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador')));

alter policy "Admins can update product-images" on storage.objects
using (bucket_id = 'product-images' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador')));

alter policy "Admins can delete product-images" on storage.objects
using (bucket_id = 'product-images' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operador')));
