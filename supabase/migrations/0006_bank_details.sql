alter table public.businesses
  add column if not exists bank_account_name   text,
  add column if not exists bank_name           text,
  add column if not exists bank_account_number text,
  add column if not exists bank_ifsc           text,
  add column if not exists upi_id              text;