-- Turn the catalogue into everyday groceries priced in rupees (₹), to go with the budget shopping list.
-- The sprayer and vermicompost listings become milk and eggs; pack sizes are part of each name.
-- supabase/seed.sql holds the same final values (and photo credits) for fresh databases, where these updates match nothing.

update public.properties set
  name = 'Organic Alphonso Mangoes (1 dozen)',
  description = 'Hand-picked Ratnagiri Alphonso mangoes, naturally ripened without carbide.',
  price = 900,
  facilities = '{"Fast Delivery","Pay on Delivery"}'
where id = 'b0000000-0000-4000-8000-000000000001';

update public.properties set
  name = 'Farm-Fresh Tomatoes (1 kg)',
  description = 'Vine-ripened tomatoes harvested the same morning they ship.',
  price = 40,
  facilities = '{"Fast Delivery","Free Delivery"}'
where id = 'b0000000-0000-4000-8000-000000000002';

update public.properties set
  name = 'Premium Cashew Nuts (250 g)',
  description = 'W240 grade whole cashews, sun-dried and vacuum packed.',
  price = 300,
  facilities = '{"Pay on Delivery","Free Delivery"}'
where id = 'b0000000-0000-4000-8000-000000000003';

update public.properties set
  name = 'Cold-Pressed Groundnut Oil (1 L)',
  description = 'Wood-pressed (kachi ghani) groundnut oil from our own harvest.',
  price = 280,
  facilities = '{"Fast Delivery","Pay on Delivery"}'
where id = 'b0000000-0000-4000-8000-000000000004';

update public.properties set
  name = 'Fresh Cow Milk (1 L)',
  type = 'Dairy & Eggs',
  description = 'Fresh cow milk from our own herd, delivered chilled every morning.',
  address = 'Anand, Gujarat',
  image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Milk_2.jpg/960px-Milk_2.jpg',
  price = 68,
  area = 0,
  rating = 4.6,
  fertilizers_percentage = null,
  pesticides_insecticides = null,
  facilities = '{"Fast Delivery","Pay on Delivery"}'
where id = 'b0000000-0000-4000-8000-000000000005';

update public.properties set
  name = 'Desi Eggs (12 pcs)',
  type = 'Dairy & Eggs',
  description = 'Free-range country eggs, collected daily and packed in a tray of 12.',
  address = 'Namakkal, Tamil Nadu',
  image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Brown-eggs.jpg/960px-Brown-eggs.jpg',
  price = 120,
  area = 0,
  rating = 4.8,
  fertilizers_percentage = null,
  pesticides_insecticides = null,
  facilities = '{"Fast Delivery","Free Delivery"}'
where id = 'b0000000-0000-4000-8000-000000000006';

update public.galleries set
  image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Ten_brown_eggs.jpg/960px-Ten_brown_eggs.jpg'
where id = 'c0000000-0000-4000-8000-000000000005';

update public.reviews set review = 'Fresh and creamy, and it arrives before 7 am every day.', rating = 5
where id = 'd0000000-0000-4000-8000-000000000005';

update public.reviews set review = 'Bright yolks and not a single cracked egg in the tray.', rating = 5
where id = 'd0000000-0000-4000-8000-000000000006';
