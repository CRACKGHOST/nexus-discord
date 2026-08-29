alter table public.messages disable row level security;
drop policy if exists "allow all" on public.messages;
create policy "allow all" on public.messages for all using (true) with check (true);
alter publication supabase_realtime add table public.messages;