begin;

alter table public.memories
add column font_key text not null default 'handwritten'
check (font_key in ('handwritten', 'serif', 'typewriter'));

drop function public.submit_memory(text,text,boolean,text,text,text,text,text,smallint);
drop function public.get_own_memory(text,uuid,text);
drop function public.update_own_memory(text,uuid,text,text,boolean,text,text,text);
drop function public.open_recipient_memory(text,text,uuid);

create function public.submit_memory(
  p_slug text,
  p_sender_name text,
  p_is_anonymous boolean,
  p_content text,
  p_visibility text,
  p_edit_passcode text,
  p_contributor_token text,
  p_color text default 'sky',
  p_rotation smallint default 0,
  p_font_key text default 'handwritten'
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
  if p_font_key is null or p_font_key not in ('handwritten', 'serif', 'typewriter') then raise exception 'invalid font'; end if;

  insert into public.memories (
    jar_id, sender_name, is_anonymous, content, visibility,
    edit_token_hash, edit_passcode_hash, color, rotation, font_key
  ) values (
    v_jar.id, case when p_is_anonymous then null else trim(p_sender_name) end,
    p_is_anonymous, trim(p_content), p_visibility,
    encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex'),
    extensions.crypt(p_edit_passcode, extensions.gen_salt('bf', 12)), p_color,
    greatest(-8, least(8, p_rotation)), p_font_key
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
  visibility text, color text, font_key text, moderation_status text, updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.sender_name, m.is_anonymous, m.content, m.visibility,
    m.color, m.font_key, m.moderation_status, m.updated_at
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
  p_color text,
  p_font_key text
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
  if p_font_key is null or p_font_key not in ('handwritten', 'serif', 'typewriter') then raise exception 'invalid font'; end if;

  update public.memories m
  set sender_name = case when p_is_anonymous then null else trim(p_sender_name) end,
      is_anonymous = p_is_anonymous,
      content = trim(p_content), visibility = p_visibility, color = p_color,
      font_key = p_font_key, moderation_status = 'pending'
  from public.jars j
  where j.id = m.jar_id and j.slug = p_slug and m.id = p_memory_id
    and j.status in ('draft', 'collecting', 'locked')
    and m.edit_passcode_hash = extensions.crypt(p_edit_passcode, m.edit_passcode_hash);
  return found;
end;
$$;

create function public.open_recipient_memory(p_slug text, p_session_token text, p_memory_id uuid)
returns table (id uuid, content text, sender_name text, is_anonymous boolean, color text, font_key text, created_at timestamptz)
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
  select m.id, m.content, m.sender_name, m.is_anonymous, m.color, m.font_key, m.created_at
  from public.memories m
  join public.jars j on j.id = m.jar_id
  where j.slug = p_slug and m.id = p_memory_id and m.moderation_status = 'approved';
end;
$$;

revoke all on function public.submit_memory(text,text,boolean,text,text,text,text,text,smallint,text) from public;
revoke all on function public.get_own_memory(text,uuid,text) from public;
revoke all on function public.update_own_memory(text,uuid,text,text,boolean,text,text,text,text) from public;
revoke all on function public.open_recipient_memory(text,text,uuid) from public;

grant execute on function public.submit_memory(text,text,boolean,text,text,text,text,text,smallint,text) to anon, authenticated;
grant execute on function public.get_own_memory(text,uuid,text) to anon, authenticated;
grant execute on function public.update_own_memory(text,uuid,text,text,boolean,text,text,text,text) to anon, authenticated;
grant execute on function public.open_recipient_memory(text,text,uuid) to anon, authenticated;

commit;
