-- Purchase history per signed-in user: bookings and "Buy All" orders from the app.
-- Each row is one order; `lines` holds its products as JSON:
--   [{ "name": "...", "cost": 120, "productId": "<uuid>", "quantity": 1, "unitPrice": 120 }, ...]
-- Nothing is charged in the app (payment happens on delivery), so totals are informational.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  placed_at timestamptz not null default now(),
  source text not null check (source in ('booking', 'shopping-list')),
  lines jsonb not null check (jsonb_typeof(lines) = 'array'),
  total numeric not null check (total >= 0),
  payment_mode text not null check (payment_mode in ('Cash on Delivery', 'UPI on Delivery', 'Card on Delivery')),
  note text
);

create index orders_user_id_placed_at_idx on public.orders (user_id, placed_at desc);

-- Signed-in users can add and read only their own orders; nobody can edit or delete them from the app.
alter table public.orders enable row level security;

create policy "Users can read their own orders" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users can add their own orders" on public.orders
  for insert to authenticated with check ((select auth.uid()) = user_id);
