-- businesses: settings fields (Settings page + invoices)
alter table businesses
  add column if not exists owner_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists gstin text,
  add column if not exists invoice_prefix text not null default 'INV',
  add column if not exists currency text not null default 'INR',
  add column if not exists description text,
  add column if not exists logo_url text;

-- customers
alter table customers drop constraint if exists customers_email_key;
alter table customers
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists notes text;

-- products
alter table products
  add column if not exists category text not null default 'Other',
  add column if not exists description text,
  add column if not exists is_active boolean not null default true;
update products set is_active = (status = 'active');
alter table products drop constraint if exists products_status_check;
alter table products drop column if exists status;
alter table products
  add constraint products_category_check
    check (category in ('Cakes','Cupcakes','Cookies','Brownies','Breads','Other'));
alter table products rename column unit_price to price;

-- orders
alter table orders
  add column if not exists order_number text,
  add column if not exists order_date date not null default current_date,
  add column if not exists delivery_time time,
  add column if not exists customer_notes text,
  add column if not exists internal_notes text,
  add column if not exists subtotal numeric(10,2) not null default 0,
  add column if not exists discount numeric(10,2) not null default 0,
  add column if not exists delivery_fee numeric(10,2) not null default 0,
  add column if not exists total numeric(10,2) not null default 0;
alter table orders alter column delivery_date set not null;

alter table orders drop constraint if exists orders_status_check;
update orders set status = 'New' where status = 'pending';
update orders set status = 'Preparing' where status = 'shipped';
update orders set status = 'Delivered' where status = 'delivered';
update orders set status = 'Cancelled' where status = 'cancelled';
alter table orders alter column status set default 'New';
alter table orders
  add constraint orders_status_check
    check (status in ('New','Confirmed','Preparing','Ready','Delivered','Cancelled'));

update orders set order_number = 'ORD-' || substr(id::text, 1, 8) where order_number is null;
alter table orders alter column order_number set not null;
alter table orders add constraint orders_business_order_number_key unique (business_id, order_number);

-- order_items
alter table order_items alter column product_id drop not null;
alter table order_items rename column item_name to name;
alter table order_items add column if not exists total numeric(10,2);
update order_items set total = unit_price * quantity where total is null;
alter table order_items alter column total set not null;

-- payments
alter table payments drop constraint if exists payments_method_check;
alter table payments
  add column if not exists payment_date date not null default current_date,
  add column if not exists notes text;
alter table payments
  add constraint payments_method_check
    check (method in ('Cash','UPI','Bank Transfer','Card','Other'));

-- invoices
alter table invoices
  add column if not exists customer_id uuid references customers(id),
  add column if not exists invoice_number text,
  add column if not exists issue_date date not null default current_date,
  add column if not exists subtotal numeric(10,2) not null default 0,
  add column if not exists discount numeric(10,2) not null default 0,
  add column if not exists delivery_fee numeric(10,2) not null default 0,
  add column if not exists total numeric(10,2) not null default 0,
  add column if not exists amount_paid numeric(10,2) not null default 0,
  add column if not exists balance_due numeric(10,2) not null default 0,
  add column if not exists notes text;

alter table invoices drop constraint if exists invoices_status_check;
update invoices set status = 'Draft' where status = 'draft';
update invoices set status = 'Issued' where status = 'issued';
update invoices set status = 'Paid' where status = 'paid';
update invoices set status = 'Draft' where status = 'void';
alter table invoices alter column status set default 'Draft';
alter table invoices
  add constraint invoices_status_check
    check (status in ('Draft','Issued','Paid','Partially Paid'));

update invoices set customer_id = orders.customer_id
  from orders where orders.id = invoices.order_id and invoices.customer_id is null;
alter table invoices alter column customer_id set not null;

update invoices set invoice_number = 'INV-' || substr(id::text, 1, 8) where invoice_number is null;
alter table invoices alter column invoice_number set not null;
alter table invoices add constraint invoices_business_invoice_number_key unique (business_id, invoice_number);

-- invoice_items
alter table invoice_items add column if not exists amount numeric(10,2);
update invoice_items set amount = unit_price * quantity where amount is null;
alter table invoice_items alter column amount set not null;