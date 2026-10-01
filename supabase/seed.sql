-- Sample data for local development / demos. Safe to re-run (skips existing ids).
-- Agent/review/article image URLs are the ones listed in lib/data.ts.
--
-- Product and gallery photos are from Wikimedia Commons (https://commons.wikimedia.org/wiki/File:<file name>).
-- CC BY / CC BY-SA photos need a visible credit (author + license) wherever the app shows them.
--   Alphonso mango.jpg ................................. G patkar, public domain
--   ALPHONSO MANGO.jpg ................................. Kunaljadhav19, CC BY-SA 4.0
--   "Aesthetic Alphonso Mango".jpg ..................... Thamizhpparithi Maari, CC BY-SA 4.0
--   Red tomatoes. img 05.jpg ........................... Dmitry Makeev, CC BY-SA 4.0
--   A man weighing tomatoes using his Tharasu in Madurai.jpg  எஸ்ஸார், CC BY-SA 3.0
--   CASHEW NUTS.jpg .................................... Ranjithkumar Murugesan, CC0
--   Cashew nuts in West Bengal of India.jpg ............ Billjones94, CC BY-SA 4.0
--   Groundnut oil.jpg .................................. KISUMAR123, CC0
--   Milk 2.jpg ......................................... Daria-Yakovleva, CC0
--   Brown-eggs.jpg ..................................... Photos public domain.com, public domain
--   Ten brown eggs.jpg ................................. EstherDje, CC BY-SA 4.0
--
-- Prices are in Indian rupees (₹); pack sizes are part of each product name.

insert into public.agents (id, name, email, avatar) values
  ('a0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh.patil@example.com', 'https://images.unsplash.com/photo-1574169208507-843761648b32?q=60&w=640&auto=format&fit=crop'),
  ('a0000000-0000-4000-8000-000000000002', 'Sunita Deshmukh', 'sunita.deshmukh@example.com', 'https://images.unsplash.com/photo-1574169208507-843761648b32?q=60&w=640&auto=format&fit=crop'),
  ('a0000000-0000-4000-8000-000000000003', 'Arjun Mehta', 'arjun.mehta@example.com', 'https://images.unsplash.com/photo-1574169208507-843761648b32?q=60&w=640&auto=format&fit=crop')
on conflict (id) do nothing;

insert into public.properties (id, name, type, description, address, image, price, area, rating, fertilizers_percentage, pesticides_insecticides, facilities, agent_id) values
  ('b0000000-0000-4000-8000-000000000001', 'Organic Alphonso Mangoes (1 dozen)', 'Fresh Fruits & Vegetables',
   'Hand-picked Ratnagiri Alphonso mangoes, naturally ripened without carbide.',
   'Ratnagiri, Maharashtra', 'https://upload.wikimedia.org/wikipedia/commons/7/79/Alphonso_mango.jpg',
   900, 1200, 4.8, '0%', 'None', '{"Fast Delivery","Pay on Delivery"}', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000002', 'Farm-Fresh Tomatoes (1 kg)', 'Fresh Fruits & Vegetables',
   'Vine-ripened tomatoes harvested the same morning they ship.',
   'Nashik, Maharashtra', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Red_tomatoes._img_05.jpg/960px-Red_tomatoes._img_05.jpg',
   40, 800, 4.5, '10%', 'Low', '{"Fast Delivery","Free Delivery"}', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000003', 'Premium Cashew Nuts (250 g)', 'Nuts & Dry Fruits',
   'W240 grade whole cashews, sun-dried and vacuum packed.',
   'Sindhudurg, Maharashtra', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/CASHEW_NUTS.jpg/960px-CASHEW_NUTS.jpg',
   300, 1500, 4.7, '5%', 'None', '{"Pay on Delivery","Free Delivery"}', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000004', 'Cold-Pressed Groundnut Oil (1 L)', 'Organic & Natural Products',
   'Wood-pressed (kachi ghani) groundnut oil from our own harvest.',
   'Junagadh, Gujarat', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Groundnut_oil.jpg/960px-Groundnut_oil.jpg',
   280, 600, 4.6, '0%', 'None', '{"Fast Delivery","Pay on Delivery"}', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000005', 'Fresh Cow Milk (1 L)', 'Dairy & Eggs',
   'Fresh cow milk from our own herd, delivered chilled every morning.',
   'Anand, Gujarat', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Milk_2.jpg/960px-Milk_2.jpg',
   68, 0, 4.6, null, null, '{"Fast Delivery","Pay on Delivery"}', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000006', 'Desi Eggs (12 pcs)', 'Dairy & Eggs',
   'Free-range country eggs, collected daily and packed in a tray of 12.',
   'Namakkal, Tamil Nadu', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Brown-eggs.jpg/960px-Brown-eggs.jpg',
   120, 0, 4.8, null, null, '{"Fast Delivery","Free Delivery"}', 'a0000000-0000-4000-8000-000000000003')
on conflict (id) do nothing;

insert into public.galleries (id, property_id, image) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/ALPHONSO_MANGO.jpg/960px-ALPHONSO_MANGO.jpg'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/%22Aesthetic_Alphonso_Mango%22.jpg/960px-%22Aesthetic_Alphonso_Mango%22.jpg'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/A_man_weighing_tomatoes_using_his_Tharasu_in_Madurai.jpg/960px-A_man_weighing_tomatoes_using_his_Tharasu_in_Madurai.jpg'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Cashew_nuts_in_West_Bengal_of_India.jpg/960px-Cashew_nuts_in_West_Bengal_of_India.jpg'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000006', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Ten_brown_eggs.jpg/960px-Ten_brown_eggs.jpg')
on conflict (id) do nothing;

insert into public.reviews (id, property_id, name, avatar, review, rating) values
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Priya S.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Sweetest mangoes we have had this season. Arrived well packed.', 5),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Kiran J.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Good quality, two were slightly overripe.', 4),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'Anil K.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Fresh and firm. Will order again.', 5),
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'Meera R.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Large, crunchy cashews. Worth the price.', 5),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'Suresh P.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Fresh and creamy, and it arrives before 7 am every day.', 5),
  ('d0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'Lata D.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Bright yolks and not a single cracked egg in the tray.', 5)
on conflict (id) do nothing;

insert into public.articles (id, name, type, date, image, description, farm_size, crop_yield, organic, section_titles, section_texts, technologies, gallery, location, conclusion, agent_id) values
  ('e0000000-0000-4000-8000-000000000001', 'How Drip Irrigation Cut Our Water Use in Half',
   '{"Farming Equipment & Tools","Fresh Fruits & Vegetables"}', '2026-08-12',
   'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop',
   'A season-long account of moving a tomato and chilli farm from flood irrigation to drip lines.',
   '5 acres', '+30%', 'Partly',
   '{"Why we switched","Installation","Results"}',
   '{"Our borewell was running dry by March every year, and flood irrigation wasted most of what we pumped.","We laid 16 mm inline drippers at 40 cm spacing, with a sand filter and a venturi for fertigation. Setup took two weekends.","Water use dropped by roughly half and yields went up because roots stayed evenly moist."}',
   '{"Drip Irrigation","Soil Testing Kits"}',
   '{"https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop","https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop"}',
   'Nashik, Maharashtra', null, 'a0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000002', 'Switching to Organic Fertilizers: A First-Season Report',
   '{"Fertilizers & Soil Conditioners","Organic & Natural Products"}', '2026-07-03',
   'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   'What happened when we replaced urea and DAP with vermicompost and jeevamrut on our groundnut fields.',
   '8 acres', '-5% (first season)', 'Yes',
   '{"Starting point","What we applied","What we would change"}',
   '{"Soil tests showed low organic carbon and hard, compacted topsoil after years of chemical fertilizer.","We applied 2 tonnes of vermicompost per acre before sowing and jeevamrut every 15 days through the irrigation line.","Yield dipped slightly in the first season, but soil texture improved visibly. Next year we will add green manure before sowing."}',
   '{"Organic Fertilizers","Soil Testing Kits"}',
   '{"https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop"}',
   'Junagadh, Gujarat', null, 'a0000000-0000-4000-8000-000000000002'),
  ('e0000000-0000-4000-8000-000000000003', 'Crop Rotation Basics for Small Farms',
   '{"Fresh Fruits & Vegetables"}', '2026-05-20',
   'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop',
   'A simple three-season rotation that breaks pest cycles and rebuilds nitrogen.',
   '3 acres', '+15%', 'Yes',
   '{"The rotation","Pairing crops"}',
   '{"Kharif: soybean (fixes nitrogen). Rabi: wheat. Summer: vegetables such as okra or cucumber.","Marigold borders around vegetable plots draw pests away from the main crop."}',
   '{"Crop Rotation","Companion Planting"}',
   '{}',
   'Pune, Maharashtra', null, 'a0000000-0000-4000-8000-000000000003')
on conflict (id) do nothing;

-- Map coordinates for the farms above (same values as migration 20261001123000_farm_locations.sql).
update public.properties as p set latitude = c.lat, longitude = c.lng
from (values
  ('b0000000-0000-4000-8000-000000000001'::uuid, 16.9934, 73.2954), -- Ratnagiri
  ('b0000000-0000-4000-8000-000000000002'::uuid, 20.0112, 73.7902), -- Nashik
  ('b0000000-0000-4000-8000-000000000003'::uuid, 16.1357, 73.6522), -- Sindhudurg
  ('b0000000-0000-4000-8000-000000000004'::uuid, 21.5220, 70.4582), -- Junagadh
  ('b0000000-0000-4000-8000-000000000005'::uuid, 22.5587, 72.9627), -- Anand
  ('b0000000-0000-4000-8000-000000000006'::uuid, 11.2192, 78.1679)  -- Namakkal
) as c(id, lat, lng)
where p.id = c.id and p.latitude is null;

update public.articles as a set latitude = c.lat, longitude = c.lng
from (values
  ('e0000000-0000-4000-8000-000000000001'::uuid, 20.0112, 73.7902), -- Nashik
  ('e0000000-0000-4000-8000-000000000002'::uuid, 21.5220, 70.4582), -- Junagadh
  ('e0000000-0000-4000-8000-000000000003'::uuid, 18.5214, 73.8545)  -- Pune
) as c(id, lat, lng)
where a.id = c.id and a.latitude is null;
