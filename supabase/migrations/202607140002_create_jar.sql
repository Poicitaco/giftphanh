create function public.create_jar(
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
    owner_id, slug, recipient_name, title, intro,
    recipient_passcode_hash, recipient_passcode_hint, open_at
  ) values (
    auth.uid(), p_slug, trim(p_recipient_name), trim(p_title), trim(p_intro),
    crypt(p_passcode, gen_salt('bf', 12)), trim(p_passcode_hint), p_open_at
  )
  returning jars.id, jars.slug;
end;
$$;

revoke all on function public.create_jar(text, text, text, text, text, text, timestamptz) from public, anon;
grant execute on function public.create_jar(text, text, text, text, text, text, timestamptz) to authenticated;
