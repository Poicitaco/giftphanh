begin;

create function public.get_recipient_all_stars(p_slug text, p_session_token text)
returns table (id uuid, color text, sender_name text, is_anonymous boolean, content text, font_key text, created_at timestamptz, opened boolean)
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
  select m.id, m.color,
    case when r.memory_id is not null then m.sender_name else null end,
    case when r.memory_id is not null then m.is_anonymous else null end,
    case when r.memory_id is not null then m.content else null end,
    case when r.memory_id is not null then m.font_key else null end,
    case when r.memory_id is not null then m.created_at else null end,
    (r.memory_id is not null)
  from public.memories m
  join public.jars j on j.id = m.jar_id
  left join public.memory_reads r on r.recipient_session_id = v_session_id and r.memory_id = m.id
  where j.slug = p_slug and j.status = 'opened' and m.moderation_status = 'approved'
  order by m.created_at;
end;
$$;

revoke all on function public.get_recipient_all_stars(text,text) from public;
grant execute on function public.get_recipient_all_stars(text,text) to anon, authenticated;

commit;
