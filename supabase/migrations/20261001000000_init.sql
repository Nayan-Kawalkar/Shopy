-- Digital Farm schema (replaces the Appwrite collections).
-- The app only reads these tables; rows are added via the dashboard, SQL, or a
-- server-side script using the secret key. Users live in Supabase Auth (auth.users).

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  avatar text
);

-- Marketplace listings shown on the Home / Explore tabs.
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  type text, -- one of the categories in constants/data.ts
  description text,
  address text,
  image text,
  price numeric,
  area numeric,
  rating numeric check (rating between 0 and 5),
  fertilizers_percentage text,
  pesticides_insecticides text,
  facilities text[] not null default '{}', -- titles from `facilities` in constants/data.ts
  agent_id uuid references public.agents (id) on delete set null
);

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  property_id uuid not null references public.properties (id) on delete cascade,
  image text not null
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  avatar text,
  review text,
  rating int check (rating between 1 and 5)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  type text[] not null default '{}', -- tags; the Articles tab filters on these
  date date,
  image text,
  description text,
  farm_size text,
  crop_yield text,
  organic text,
  section_titles text[] not null default '{}', -- section_titles[i] heads section_texts[i]
  section_texts text[] not null default '{}',
  technologies text[] not null default '{}', -- titles from `technologies` in constants/data.ts
  gallery text[] not null default '{}', -- image URLs
  location text,
  conclusion text,
  agent_id uuid references public.agents (id) on delete set null
);

create index properties_agent_id_idx on public.properties (agent_id);
create index galleries_property_id_idx on public.galleries (property_id);
create index reviews_property_id_idx on public.reviews (property_id);
create index articles_agent_id_idx on public.articles (agent_id);

-- Row Level Security: public read-only. With no insert/update/delete policies,
-- the publishable key cannot modify anything.
alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.galleries enable row level security;
alter table public.reviews enable row level security;
alter table public.articles enable row level security;

create policy "Agents are readable by everyone" on public.agents
  for select to anon, authenticated using (true);
create policy "Properties are readable by everyone" on public.properties
  for select to anon, authenticated using (true);
create policy "Galleries are readable by everyone" on public.galleries
  for select to anon, authenticated using (true);
create policy "Reviews are readable by everyone" on public.reviews
  for select to anon, authenticated using (true);
create policy "Articles are readable by everyone" on public.articles
  for select to anon, authenticated using (true);
