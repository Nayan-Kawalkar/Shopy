-- Map coordinates (WGS84 degrees) for each farm, shown on the product and article maps.
-- Geocoded once from the address text with OpenStreetMap Nominatim (town centres; Sindhudurg is the district centre).
-- supabase/seed.sql sets the same values for fresh databases, where the updates below match nothing.

alter table public.properties
  add column latitude double precision check (latitude between -90 and 90),
  add column longitude double precision check (longitude between -180 and 180);

alter table public.articles
  add column latitude double precision check (latitude between -90 and 90),
  add column longitude double precision check (longitude between -180 and 180);

update public.properties set latitude = 16.9934, longitude = 73.2954 where id = 'b0000000-0000-4000-8000-000000000001'; -- Ratnagiri
update public.properties set latitude = 20.0112, longitude = 73.7902 where id = 'b0000000-0000-4000-8000-000000000002'; -- Nashik
update public.properties set latitude = 16.1357, longitude = 73.6522 where id = 'b0000000-0000-4000-8000-000000000003'; -- Sindhudurg
update public.properties set latitude = 21.5220, longitude = 70.4582 where id = 'b0000000-0000-4000-8000-000000000004'; -- Junagadh
update public.properties set latitude = 22.5587, longitude = 72.9627 where id = 'b0000000-0000-4000-8000-000000000005'; -- Anand
update public.properties set latitude = 11.2192, longitude = 78.1679 where id = 'b0000000-0000-4000-8000-000000000006'; -- Namakkal

update public.articles set latitude = 20.0112, longitude = 73.7902 where id = 'e0000000-0000-4000-8000-000000000001'; -- Nashik
update public.articles set latitude = 21.5220, longitude = 70.4582 where id = 'e0000000-0000-4000-8000-000000000002'; -- Junagadh
update public.articles set latitude = 18.5214, longitude = 73.8545 where id = 'e0000000-0000-4000-8000-000000000003'; -- Pune
