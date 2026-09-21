-- Enable RLS
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Profiles: only own row
create policy "Profiles are self-owned"
on profiles for select using (id = auth.uid());
create policy "Profiles update self"
on profiles for update using (id = auth.uid());

-- Businesses: create allowed, view/update only own
create policy "Businesses create"
on businesses for insert with check (true);
create policy "Businesses view/update own"
on businesses for all using (id = (select business_id from profiles where id = auth.uid()));

-- Customers, Products, Orders, Order Items, Payments, Invoices, Invoice Items
-- Scoped by business_id
create policy "Business scoped select"
on customers for select using (business_id = current_business_id());
create policy "Business scoped crud"
on customers for all using (business_id = current_business_id()) with check (business_id = current_business_id());

-- Repeat for each table
create policy "Business scoped select" on products for select using (business_id = current_business_id());
create policy "Business scoped crud" on products for all using (business_id = current_business_id()) with check (business_id = current_business_id());

create policy "Business scoped select" on orders for select using (business_id = current_business_id());
create policy "Business scoped crud" on orders for all using (business_id = current_business_id()) with check (business_id = current_business_id());

create policy "Business scoped select" on order_items for select using (business_id = current_business_id());
create policy "Business scoped crud" on order_items for all using (business_id = current_business_id()) with check (business_id = current_business_id());

create policy "Business scoped select" on payments for select using (business_id = current_business_id());
create policy "Business scoped crud" on payments for all using (business_id = current_business_id()) with check (business_id = current_business_id());

create policy "Business scoped select" on invoices for select using (business_id = current_business_id());
create policy "Business scoped crud" on invoices for all using (business_id = current_business_id()) with check (business_id = current_business_id());

create policy "Business scoped select" on invoice_items for select using (business_id = current_business_id());
create policy "Business scoped crud" on invoice_items for all using (business_id = current_business_id()) with check (business_id = current_business_id());
