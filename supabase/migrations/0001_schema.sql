-- Businesses
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references businesses(id),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id),
  name text not null,
  email text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id),
  name text not null,
  unit_price numeric not null check (unit_price >= 0),
  status text check (status in ('active','inactive')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id),
  customer_id uuid not null references customers(id),
  delivery_date date,
  status text check (status in ('pending','shipped','delivered','cancelled')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items (snapshot product info)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  business_id uuid not null references businesses(id),
  product_id uuid not null references products(id),
  item_name text not null,
  unit_price numeric not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments (multiple per order)
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  business_id uuid not null references businesses(id),
  amount numeric not null check (amount >= 0),
  method text check (method in ('card','cash','bank_transfer')),
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  business_id uuid not null references businesses(id),
  status text check (status in ('draft','issued','paid','void')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoice Items
create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id),
  business_id uuid not null references businesses(id),
  description text not null,
  unit_price numeric not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_orders_business_id on orders(business_id);
create index idx_orders_customer_id on orders(customer_id);
create index idx_orders_delivery_date on orders(delivery_date);
create index idx_order_items_order_id on order_items(order_id);
create index idx_payments_order_id on payments(order_id);
create index idx_invoices_order_id on invoices(order_id);
