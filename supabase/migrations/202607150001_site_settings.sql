create table public.site_settings (
  id boolean primary key default true check (id),
  copy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "anyone reads site copy" on public.site_settings for select using (true);
create policy "super admin inserts site copy" on public.site_settings for insert to authenticated
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'itentad.work@gmail.com');
create policy "super admin updates site copy" on public.site_settings for update to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'itentad.work@gmail.com')
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'itentad.work@gmail.com');

insert into public.site_settings (id) values (true);
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
