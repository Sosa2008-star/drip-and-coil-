-- DRIP & COIL / Supabase schema
create extension if not exists pgcrypto;

create type public.product_category as enum ('electronics','clothing','vape','liquids');
create type public.order_status as enum ('created','confirmed','packing','shipping','arrived','completed','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  city text,
  address text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.product_category not null,
  price numeric(12,2) not null default 0,
  image_url text,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  total numeric(12,2) not null default 0,
  status public.order_status not null default 'created',
  city text not null,
  address text not null,
  phone text not null,
  tracking_number text,
  eta date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check(quantity>0),
  price numeric(12,2) not null
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.news enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

create policy "profiles own read" on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id=auth.uid() or public.is_admin());
create policy "profiles insert own" on public.profiles for insert with check (id=auth.uid());

create policy "products public read" on public.products for select using (is_active=true or public.is_admin());
create policy "products admin insert" on public.products for insert with check (public.is_admin());
create policy "products admin update" on public.products for update using (public.is_admin());
create policy "products admin delete" on public.products for delete using (public.is_admin());

create policy "news public read" on public.news for select using (is_published=true or public.is_admin());
create policy "news admin insert" on public.news for insert with check (public.is_admin());
create policy "news admin update" on public.news for update using (public.is_admin());
create policy "news admin delete" on public.news for delete using (public.is_admin());

create policy "orders own read" on public.orders for select using (user_id=auth.uid() or public.is_admin());
create policy "orders own insert" on public.orders for insert with check (user_id=auth.uid());
create policy "orders admin update" on public.orders for update using (public.is_admin());

create policy "items own read" on public.order_items for select using (
  public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid())
);
create policy "items own insert" on public.order_items for insert with check (
  exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid())
);
create policy "items admin update" on public.order_items for update using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin insert into public.profiles(id,name,city) values(new.id,new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'city'); return new; end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- IMPORTANT: after your own account is registered, make it admin manually:
-- update public.profiles set role='admin' where id='YOUR-AUTH-USER-UUID';
