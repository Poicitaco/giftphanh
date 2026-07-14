-- Public jar flows. Anonymous visitors never receive direct table access;
-- every public operation is validated by a narrow security-definer function.

create or replace function public.create_jar(
  p_slug text,
  p_recipient_name text,
  p_title text,
  p_intro text,
  p_passcode text,
  p_passcode_hint text,
  p_open_at timestamptz default null
)
returns table (id uuid, slug text)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if char_length(p_passcode) < 6 or char_length(p_passcode) > 72 then
    raise exception 'passcode must contain 6 to 72 characters';
  end if;

  return query
  insert into public.jars (
    owner_id, slug, recipient_name, title, intro, status,
    recipient_passcode_hash, recipient_passcode_hint, open_at
  ) values (
    auth.uid(), p_slug, trim(p_recipient_name), trim(p_title), trim(p_intro), 'collecting',
    extensions.crypt(p_passcode, extensions.gen_salt('bf', 12)), trim(p_passcode_hint), p_open_at
  )
  returning jars.id, jars.slug;
end;
$$;

create function public.get_public_jar(p_slug text)
returns table (
  slug text,
  recipient_name text,
  title text,
  intro text,
  status text,
  recipient_passcode_hint text,
  allow_contributor_gallery boolean,
  open_at timestamptz,
  memory_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select j.slug, j.recipient_name, j.title, j.intro, j.status,
    j.recipient_passcode_hint, j.allow_contributor_gallery, j.open_at,
    count(m.id) filter (where m.moderation_status = 'approved')
  from public.jars j
  left join public.memories m on m.jar_id = j.id
  where j.slug = p_slug
  group by j.id;
$$;

create function public.submit_memory(
  p_slug text,
  p_sender_name text,
  p_is_anonymous boolean,
  p_content text,
  p_visibility text,
  p_edit_passcode text,
  p_contributor_token text,
  p_color text default 'sky',
  p_rotation smallint default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jar public.jars%rowtype;
  v_memory_id uuid;
begin
  select * into v_jar from public.jars where jars.slug = p_slug;
  if not found then raise exception 'jar not found'; end if;
  if v_jar.status not in ('draft', 'collecting') then
    raise exception 'this jar is not accepting letters';
  end if;
  if char_length(trim(p_content)) < 1 or char_length(trim(p_content)) > 10000 then
    raise exception 'letter must contain 1 to 10000 characters';
  end if;
  if not p_is_anonymous and (p_sender_name is null or char_length(trim(p_sender_name)) not between 1 and 100) then
    raise exception 'sender name is required';
  end if;
  if char_length(p_edit_passcode) < 6 or char_length(p_edit_passcode) > 72 then
    raise exception 'edit passcode must contain 6 to 72 characters';
  end if;
  if char_length(p_contributor_token) < 32 then raise exception 'invalid contributor token'; end if;
  if p_visibility not in ('private', 'contributors') then raise exception 'invalid visibility'; end if;
  if p_color not in ('mint', 'lavender', 'sky', 'sage', 'pink', 'peach', 'coral', 'yellow') then
    raise exception 'invalid color';
  end if;

  insert into public.memories (
    jar_id, sender_name, is_anonymous, content, visibility,
    edit_token_hash, edit_passcode_hash, color, rotation
  ) values (
    v_jar.id, case when p_is_anonymous then null else trim(p_sender_name) end,
    p_is_anonymous, trim(p_content), p_visibility,
    encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex'),
    extensions.crypt(p_edit_passcode, extensions.gen_salt('bf', 12)), p_color,
    greatest(-8, least(8, p_rotation))
  ) returning id into v_memory_id;

  insert into public.contributors (jar_id, access_token_hash)
  values (v_jar.id, encode(extensions.digest(p_contributor_token, 'sha256'), 'hex'))
  on conflict (access_token_hash) do nothing;

  return v_memory_id;
end;
$$;

create function public.get_own_memory(p_slug text, p_memory_id uuid, p_edit_passcode text)
returns table (
  id uuid, sender_name text, is_anonymous boolean, content text,
  visibility text, color text, moderation_status text, updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.sender_name, m.is_anonymous, m.content, m.visibility,
    m.color, m.moderation_status, m.updated_at
  from public.memories m
  join public.jars j on j.id = m.jar_id
  where j.slug = p_slug and m.id = p_memory_id
    and m.edit_passcode_hash = extensions.crypt(p_edit_passcode, m.edit_passcode_hash);
$$;

create function public.update_own_memory(
  p_slug text,
  p_memory_id uuid,
  p_edit_passcode text,
  p_sender_name text,
  p_is_anonymous boolean,
  p_content text,
  p_visibility text,
  p_color text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(p_content)) < 1 or char_length(trim(p_content)) > 10000 then
    raise exception 'letter must contain 1 to 10000 characters';
  end if;
  if not p_is_anonymous and (p_sender_name is null or char_length(trim(p_sender_name)) not between 1 and 100) then
    raise exception 'sender name is required';
  end if;
  if p_visibility not in ('private', 'contributors') then raise exception 'invalid visibility'; end if;
  if p_color not in ('mint', 'lavender', 'sky', 'sage', 'pink', 'peach', 'coral', 'yellow') then
    raise exception 'invalid color';
  end if;

  update public.memories m
  set sender_name = case when p_is_anonymous then null else trim(p_sender_name) end,
      is_anonymous = p_is_anonymous,
      content = trim(p_content), visibility = p_visibility, color = p_color,
      moderation_status = 'pending'
  from public.jars j
  where j.id = m.jar_id and j.slug = p_slug and m.id = p_memory_id
    and j.status in ('draft', 'collecting', 'locked')
    and m.edit_passcode_hash = extensions.crypt(p_edit_passcode, m.edit_passcode_hash);
  return found;
end;
$$;

create function public.get_contributor_gallery(p_slug text, p_contributor_token text)
returns table (id uuid, content text, sender_name text, is_anonymous boolean, color text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.content, m.sender_name, m.is_anonymous, m.color, m.created_at
  from public.memories m
  join public.jars j on j.id = m.jar_id
  where j.slug = p_slug and j.allow_contributor_gallery
    and m.moderation_status = 'approved' and m.visibility = 'contributors'
    and exists (
      select 1 from public.contributors c
      where c.jar_id = j.id
        and c.access_token_hash = encode(extensions.digest(p_contributor_token, 'sha256'), 'hex')
    )
  order by m.created_at desc;
$$;

create function public.unlock_recipient(p_slug text, p_passcode text, p_session_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jar public.jars%rowtype;
  v_hash text := encode(extensions.digest(p_session_token, 'sha256'), 'hex');
  v_session public.recipient_sessions%rowtype;
  v_attempts smallint;
begin
  if char_length(p_session_token) < 32 then return 'invalid'; end if;
  select * into v_jar from public.jars where jars.slug = p_slug;
  if not found then return 'not_found'; end if;
  if v_jar.status <> 'opened' then return 'not_opened'; end if;

  select * into v_session from public.recipient_sessions where token_hash = v_hash;
  if found and v_session.locked_until is not null and v_session.locked_until > now() then
    return 'locked';
  end if;

  if v_jar.recipient_passcode_hash <> extensions.crypt(p_passcode, v_jar.recipient_passcode_hash) then
    v_attempts := coalesce(v_session.failed_attempts, 0) + 1;
    insert into public.recipient_sessions (jar_id, token_hash, failed_attempts, locked_until, expires_at)
    values (v_jar.id, v_hash, v_attempts,
      case when v_attempts >= 5 then now() + interval '15 minutes' else null end,
      now() + interval '1 day')
    on conflict (token_hash) do update set
      failed_attempts = excluded.failed_attempts,
      locked_until = excluded.locked_until,
      expires_at = excluded.expires_at;
    return case when v_attempts >= 5 then 'locked' else 'wrong_passcode' end;
  end if;

  insert into public.recipient_sessions (jar_id, token_hash, failed_attempts, locked_until, expires_at)
  values (v_jar.id, v_hash, 0, null, now() + interval '7 days')
  on conflict (token_hash) do update set
    jar_id = excluded.jar_id, failed_attempts = 0, locked_until = null,
    expires_at = excluded.expires_at;
  return 'ok';
end;
$$;

create function public.get_recipient_stars(p_slug text, p_session_token text)
returns table (id uuid, color text, rotation smallint, opened boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.color, m.rotation, (r.memory_id is not null)
  from public.memories m
  join public.jars j on j.id = m.jar_id
  join public.recipient_sessions s on s.jar_id = j.id
    and s.token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex')
    and s.expires_at > now() and (s.locked_until is null or s.locked_until <= now())
  left join public.memory_reads r on r.recipient_session_id = s.id and r.memory_id = m.id
  where j.slug = p_slug and j.status = 'opened' and m.moderation_status = 'approved'
  order by m.created_at;
$$;

create function public.open_recipient_memory(p_slug text, p_session_token text, p_memory_id uuid)
returns table (id uuid, content text, sender_name text, is_anonymous boolean, color text, created_at timestamptz)
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

  insert into public.memory_reads (recipient_session_id, memory_id)
  select v_session_id, m.id
  from public.memories m
  join public.jars j on j.id = m.jar_id
  where j.slug = p_slug and m.id = p_memory_id and m.moderation_status = 'approved'
  on conflict do nothing;

  return query
  select m.id, m.content, m.sender_name, m.is_anonymous, m.color, m.created_at
  from public.memories m
  join public.jars j on j.id = m.jar_id
  where j.slug = p_slug and m.id = p_memory_id and m.moderation_status = 'approved';
end;
$$;

revoke all on function public.get_public_jar(text) from public;
revoke all on function public.submit_memory(text,text,boolean,text,text,text,text,text,smallint) from public;
revoke all on function public.get_own_memory(text,uuid,text) from public;
revoke all on function public.update_own_memory(text,uuid,text,text,boolean,text,text,text) from public;
revoke all on function public.get_contributor_gallery(text,text) from public;
revoke all on function public.unlock_recipient(text,text,text) from public;
revoke all on function public.get_recipient_stars(text,text) from public;
revoke all on function public.open_recipient_memory(text,text,uuid) from public;

grant execute on function public.get_public_jar(text) to anon, authenticated;
grant execute on function public.submit_memory(text,text,boolean,text,text,text,text,text,smallint) to anon, authenticated;
grant execute on function public.get_own_memory(text,uuid,text) to anon, authenticated;
grant execute on function public.update_own_memory(text,uuid,text,text,boolean,text,text,text) to anon, authenticated;
grant execute on function public.get_contributor_gallery(text,text) to anon, authenticated;
grant execute on function public.unlock_recipient(text,text,text) to anon, authenticated;
grant execute on function public.get_recipient_stars(text,text) to anon, authenticated;
grant execute on function public.open_recipient_memory(text,text,uuid) to anon, authenticated;
