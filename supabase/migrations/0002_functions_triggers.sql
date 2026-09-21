-- Trigger to auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to tables with updated_at
do $$
declare
  r record;
begin
  for r in
    select table_name
    from information_schema.columns
    where column_name = 'updated_at'
      and table_schema = 'public'
  loop
    execute format(
      'create trigger set_updated_at before update on %I
       for each row execute function set_updated_at();',
      r.table_name
    );
  end loop;
end;
$$;

-- Function to get current business_id
create or replace function current_business_id()
returns uuid
security definer
as $$
  select business_id from profiles
  where id = auth.uid();
$$ language sql;

-- Trigger to auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
