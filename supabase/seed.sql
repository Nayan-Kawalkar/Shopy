-- Sample data for local development / demos. Safe to re-run (skips existing ids).
-- Image URLs are the same ones listed in lib/data.ts.

insert into public.agents (id, name, email, avatar) values
  ('a0000000-0000-4000-8000-000000000001', 'Ramesh Patil', 'ramesh.patil@example.com', 'https://images.unsplash.com/photo-1574169208507-843761648b32?q=60&w=640&auto=format&fit=crop'),
  ('a0000000-0000-4000-8000-000000000002', 'Sunita Deshmukh', 'sunita.deshmukh@example.com', 'https://images.unsplash.com/photo-1574169208507-843761648b32?q=60&w=640&auto=format&fit=crop'),
  ('a0000000-0000-4000-8000-000000000003', 'Arjun Mehta', 'arjun.mehta@example.com', 'https://images.unsplash.com/photo-1574169208507-843761648b32?q=60&w=640&auto=format&fit=crop')
on conflict (id) do nothing;

insert into public.properties (id, name, type, description, address, image, price, area, rating, fertilizers_percentage, pesticides_insecticides, facilities, agent_id) values
  ('b0000000-0000-4000-8000-000000000001', 'Organic Alphonso Mangoes', 'Fresh Fruits & Vegetables',
   'Hand-picked Alphonso mangoes, naturally ripened without carbide. Sold by the dozen.',
   'Ratnagiri, Maharashtra', 'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   450, 1200, 4.8, '0%', 'None', '{"Fast Delivery","Pay on Delivery","10 days Return & Exchange"}', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000002', 'Farm-Fresh Tomatoes', 'Fresh Fruits & Vegetables',
   'Vine-ripened tomatoes harvested the same morning they ship. 5 kg crate.',
   'Nashik, Maharashtra', 'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   180, 800, 4.5, '10%', 'Low', '{"Fast Delivery","Free Delivery"}', 'a0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000003', 'Premium Cashew Nuts', 'Nuts & Dry Fruits',
   'W240 grade whole cashews, sun-dried and vacuum packed. 1 kg pack.',
   'Sindhudurg, Maharashtra', 'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   950, 1500, 4.7, '5%', 'None', '{"Pay on Delivery","Free Delivery","EMI Payment"}', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000004', 'Cold-Pressed Groundnut Oil', 'Organic & Natural Products',
   'Wood-pressed (kachi ghani) groundnut oil from our own harvest. 5 litre can.',
   'Junagadh, Gujarat', 'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   1350, 600, 4.6, '0%', 'None', '{"Fast Delivery","10 days Return & Exchange"}', 'a0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000005', 'Battery Knapsack Sprayer', 'Farming Equipment & Tools',
   '16 litre battery-operated sprayer with adjustable nozzle. One-year warranty.',
   'Pune, Maharashtra', 'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   2800, 0, 4.3, 'N/A', 'N/A', '{"EMI Payment","Pay on Delivery","10 days Return & Exchange"}', 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000006', 'Vermicompost (25 kg)', 'Fertilizers & Soil Conditioners',
   'Earthworm compost that improves soil structure and water retention.',
   'Ahmednagar, Maharashtra', 'https://images.unsplash.com/photo-1598514982836-3dc8c9c3e6d3?q=60&w=640&auto=format&fit=crop',
   400, 0, 4.9, '100% organic', 'None', '{"Free Delivery","Pay on Delivery"}', 'a0000000-0000-4000-8000-000000000003')
on conflict (id) do nothing;

insert into public.galleries (id, property_id, image) values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1582515073490-399813d332b6?q=60&w=640&auto=format&fit=crop')
on conflict (id) do nothing;

insert into public.reviews (id, property_id, name, avatar, review, rating) values
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Priya S.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Sweetest mangoes we have had this season. Arrived well packed.', 5),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Kiran J.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Good quality, two were slightly overripe.', 4),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'Anil K.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Fresh and firm. Will order again.', 5),
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'Meera R.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Large, crunchy cashews. Worth the price.', 5),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'Suresh P.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Battery lasts about four hours of spraying.', 4),
  ('d0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'Lata D.', 'https://images.unsplash.com/photo-1604152135912-04a2f55c4aa2?q=60&w=640&auto=format&fit=crop', 'Noticeable difference in my vegetable beds within a month.', 5)
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
