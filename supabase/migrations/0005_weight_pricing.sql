-- Adds weight-based pricing: a product can be sold per piece (as
-- before) or per kilogram, in which case order quantities are
-- captured in grams (500, 120, etc.) rather than a piece count.

alter table public.products
  add column if not exists pricing_unit text not null default 'piece'
    check (pricing_unit in ('piece', 'kg'));

-- order_items records the unit alongside each line, independent of
-- the product's *current* setting, so historical orders keep
-- displaying correctly even if a product's pricing_unit changes later
-- (or the item was a custom, product-less line to begin with).
alter table public.order_items
  add column if not exists unit text not null default 'piece'
    check (unit in ('piece', 'kg'));