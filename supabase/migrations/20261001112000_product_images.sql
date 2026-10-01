-- Swap the placeholder product/gallery photos for real ones from Wikimedia Commons
-- (credits and licenses are listed in supabase/seed.sql, which has the same URLs for fresh databases).
-- On a fresh database these rows don't exist yet, so the updates match nothing and the seed applies instead.

update public.properties set image = 'https://upload.wikimedia.org/wikipedia/commons/7/79/Alphonso_mango.jpg'
  where id = 'b0000000-0000-4000-8000-000000000001';
update public.properties set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Red_tomatoes._img_05.jpg/960px-Red_tomatoes._img_05.jpg'
  where id = 'b0000000-0000-4000-8000-000000000002';
update public.properties set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/CASHEW_NUTS.jpg/960px-CASHEW_NUTS.jpg'
  where id = 'b0000000-0000-4000-8000-000000000003';
update public.properties set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Groundnut_oil.jpg/960px-Groundnut_oil.jpg'
  where id = 'b0000000-0000-4000-8000-000000000004';
update public.properties set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Knapsack_sprayer.jpg/960px-Knapsack_sprayer.jpg'
  where id = 'b0000000-0000-4000-8000-000000000005';
update public.properties set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Vermicast_in_2kg_bag.png/960px-Vermicast_in_2kg_bag.png'
  where id = 'b0000000-0000-4000-8000-000000000006';

update public.galleries set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/ALPHONSO_MANGO.jpg/960px-ALPHONSO_MANGO.jpg'
  where id = 'c0000000-0000-4000-8000-000000000001';
update public.galleries set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/%22Aesthetic_Alphonso_Mango%22.jpg/960px-%22Aesthetic_Alphonso_Mango%22.jpg'
  where id = 'c0000000-0000-4000-8000-000000000002';
update public.galleries set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/A_man_weighing_tomatoes_using_his_Tharasu_in_Madurai.jpg/960px-A_man_weighing_tomatoes_using_his_Tharasu_in_Madurai.jpg'
  where id = 'c0000000-0000-4000-8000-000000000003';
update public.galleries set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Cashew_nuts_in_West_Bengal_of_India.jpg/960px-Cashew_nuts_in_West_Bengal_of_India.jpg'
  where id = 'c0000000-0000-4000-8000-000000000004';
update public.galleries set image = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Sifted_vermicompost_vermicast.png/960px-Sifted_vermicompost_vermicast.png'
  where id = 'c0000000-0000-4000-8000-000000000005';
