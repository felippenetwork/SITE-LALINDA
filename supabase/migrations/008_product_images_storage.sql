-- Storage bucket for product/line photos uploaded from the admin panel.
-- Public read (photos are meant to be publicly visible on the site);
-- write restricted to admins. File type/size are also enforced at the
-- bucket level as defense in depth (app layer re-validates by magic
-- bytes, since Content-Type here is still client-declared).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

create policy "Public read access to product-images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Admins can upload to product-images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update product-images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete product-images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
