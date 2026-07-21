-- 2. Update submit_memory RPC to require authentication and accept the new password fields.
-- We also remove is_anonymous (force false) and visibility (force 'public' or something).
drop function if exists public.submit_memory(text,text,boolean,text,text,text,text,text,smallint);

create or replace function public.submit_memory(
  p_slug text,
  p_sender_name text,
  p_content text,
  p_edit_passcode text,
  p_contributor_token text,
  p_color text default 'sky',
  p_rotation smallint default 0,
  p_recipient_password text default null,
  p_recipient_password_hint text default null,
  p_font_key text default 'cormorant'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jar public.jars%rowtype;
  v_memory_id uuid;
  v_recip_hash text := null;
begin
  if auth.uid() is null then
    raise exception 'authentication required to write a letter';
  end if;

  select * into v_jar from public.jars where jars.slug = p_slug;
  if not found then raise exception 'jar not found'; end if;
  if v_jar.status not in ('draft', 'collecting') then
    raise exception 'this jar is not accepting letters';
  end if;
  
  if char_length(trim(p_content)) < 1 or char_length(trim(p_content)) > 10000 then
    raise exception 'letter must contain 1 to 10000 characters';
  end if;
  if p_sender_name is null or char_length(trim(p_sender_name)) not between 1 and 100 then
    raise exception 'sender name is required';
  end if;
  if char_length(p_edit_passcode) < 6 or char_length(p_edit_passcode) > 72 then
    raise exception 'edit passcode must contain 6 to 72 characters';
  end if;
  if char_length(p_contributor_token) < 32 then raise exception 'invalid contributor token'; end if;
  if p_color not in ('mint', 'lavender', 'sky', 'sage', 'pink', 'peach', 'coral', 'yellow') then
    raise exception 'invalid color';
  end if;
  
  if p_recipient_password is not null and char_length(trim(p_recipient_password)) > 0 then
    v_recip_hash := extensions.crypt(trim(p_recipient_password), extensions.gen_salt('bf', 12));
  end if;

  insert into public.memories (
    jar_id, sender_name, is_anonymous, content, visibility,
    edit_token_hash, edit_passcode_hash, color, rotation,
    recipient_password_hash, recipient_password_hint, font_key
  ) values (
    v_jar.id, trim(p_sender_name), false, trim(p_content), 'contributors',
    encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex'),
    extensions.crypt(p_edit_passcode, extensions.gen_salt('bf', 12)), p_color,
    greatest(-8, least(8, p_rotation)),
    v_recip_hash, trim(p_recipient_password_hint), p_font_key
  ) returning id into v_memory_id;

  insert into public.contributors (jar_id, access_token_hash)
  values (v_jar.id, encode(extensions.digest(p_contributor_token, 'sha256'), 'hex'))
  on conflict (access_token_hash) do nothing;

  return v_memory_id;
end;
$$;

grant execute on function public.submit_memory(text,text,text,text,text,text,smallint,text,text,text) to anon, authenticated;

-- 3. Update get_recipient_stars to include whether a star is password protected
drop function if exists public.get_recipient_stars(text,text);

create or replace function public.get_recipient_stars(p_slug text, p_session_token text)
returns table (id uuid, color text, rotation smallint, opened boolean, is_locked boolean, password_hint text)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.color, m.rotation, (r.memory_id is not null),
         (m.recipient_password_hash is not null), m.recipient_password_hint
  from public.memories m
  join public.jars j on j.id = m.jar_id
  join public.recipient_sessions s on s.jar_id = j.id
    and s.token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex')
    and s.expires_at > now() and (s.locked_until is null or s.locked_until <= now())
  left join public.memory_reads r on r.recipient_session_id = s.id and r.memory_id = m.id
  where j.slug = p_slug and j.status = 'opened' and m.moderation_status = 'approved'
  order by m.created_at;
$$;
grant execute on function public.get_recipient_stars(text,text) to anon, authenticated;

-- 4. Update open_recipient_memory to require the star password if it exists
drop function if exists public.open_recipient_memory(text,text,uuid);
drop function if exists public.open_recipient_memory(text,text,uuid,text);

create or replace function public.open_recipient_memory(p_slug text, p_session_token text, p_memory_id uuid, p_star_password text default null)
returns table (id uuid, content text, sender_name text, is_anonymous boolean, color text, created_at timestamptz, font_key text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid;
  v_memory public.memories%rowtype;
begin
  select s.id into v_session_id
  from public.recipient_sessions s
  join public.jars j on j.id = s.jar_id
  where j.slug = p_slug and j.status = 'opened'
    and s.token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex')
    and s.expires_at > now() and (s.locked_until is null or s.locked_until <= now());
  if v_session_id is null then return; end if;

  select m.* into v_memory
  from public.memories m
  join public.jars j on j.id = m.jar_id
  where j.slug = p_slug and m.id = p_memory_id and m.moderation_status = 'approved';
  
  if not found then return; end if;

  -- Verify star password if it exists
  if v_memory.recipient_password_hash is not null then
    if p_star_password is null or v_memory.recipient_password_hash <> extensions.crypt(trim(p_star_password), v_memory.recipient_password_hash) then
      raise exception 'invalid star password';
    end if;
  end if;

  insert into public.memory_reads (recipient_session_id, memory_id)
  values (v_session_id, v_memory.id)
  on conflict do nothing;

  return query
  select m.id, m.content, m.sender_name, m.is_anonymous, m.color, m.created_at, m.font_key
  from public.memories m
  where m.id = v_memory.id;
end;
$$;
grant execute on function public.open_recipient_memory(text,text,uuid,text) to anon, authenticated;

-- 5. Update get_recipient_all_stars
drop function if exists public.get_recipient_all_stars(text,text);
create or replace function public.get_recipient_all_stars(p_slug text, p_session_token text)
returns table (id uuid, content text, sender_name text, is_anonymous boolean, color text, created_at timestamptz, font_key text, opened boolean, is_locked boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid;
begin
  select s.id into v_session_id
  from public.recipient_sessions s
  join public.jars j on j.id = s.jar_id
  where j.slug = p_slug and j.status = 'opened'
    and s.token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex')
    and s.expires_at > now() and (s.locked_until is null or s.locked_until <= now());
  
  if v_session_id is null then return; end if;

  return query
  select m.id,
         case when (m.recipient_password_hash is not null and r.memory_id is null) then null else m.content end as content,
         m.sender_name, m.is_anonymous, m.color, m.created_at, m.font_key,
         (r.memory_id is not null) as opened,
         (m.recipient_password_hash is not null) as is_locked
  from public.memories m
  join public.jars j on j.id = m.jar_id
  left join public.memory_reads r on r.recipient_session_id = v_session_id and r.memory_id = m.id
  where j.slug = p_slug and m.moderation_status = 'approved'
  order by m.created_at;
end;
$$;
grant execute on function public.get_recipient_all_stars(text,text) to anon, authenticated;

-- 6. Add get_single_gift_jar RPC
drop function if exists public.get_single_gift_jar();
create or replace function public.get_single_gift_jar()
returns table (slug text, recipient_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select j.slug, j.recipient_name from public.jars j limit 1;
$$;
grant execute on function public.get_single_gift_jar() to anon, authenticated;
