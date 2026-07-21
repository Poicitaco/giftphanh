-- Cap nhat submit_memory de nhan them photo_url
CREATE OR REPLACE FUNCTION public.submit_memory(
  p_slug text,
  p_sender_name text,
  p_content text,
  p_edit_passcode text,
  p_contributor_token text,
  p_color text default 'sky',
  p_rotation smallint default 0,
  p_recipient_password text default null,
  p_recipient_password_hint text default null,
  p_font_key text default 'cormorant',
  p_photo_url text default null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_jar public.jars%rowtype;
  v_memory_id uuid;
  v_recip_hash text := null;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required to write a letter';
  END IF;

  SELECT * INTO v_jar FROM public.jars WHERE jars.slug = p_slug;
  IF NOT FOUND THEN RAISE EXCEPTION 'jar not found'; END IF;
  IF v_jar.status NOT IN ('draft', 'collecting') THEN
    RAISE EXCEPTION 'this jar is not accepting letters';
  END IF;
  
  IF char_length(trim(p_content)) < 1 OR char_length(trim(p_content)) > 10000 THEN
    RAISE EXCEPTION 'letter must contain 1 to 10000 characters';
  END IF;
  IF p_sender_name IS NULL OR char_length(trim(p_sender_name)) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'sender name is required';
  END IF;
  IF char_length(p_edit_passcode) < 6 OR char_length(p_edit_passcode) > 72 THEN
    RAISE EXCEPTION 'edit passcode must contain 6 to 72 characters';
  END IF;
  IF char_length(p_contributor_token) < 32 THEN RAISE EXCEPTION 'invalid contributor token'; END IF;
  IF p_color NOT IN ('mint', 'lavender', 'sky', 'sage', 'pink', 'peach', 'coral', 'yellow') THEN
    RAISE EXCEPTION 'invalid color';
  END IF;
  
  IF p_recipient_password IS NOT NULL AND char_length(trim(p_recipient_password)) > 0 THEN
    v_recip_hash := extensions.crypt(trim(p_recipient_password), extensions.gen_salt('bf', 12));
  END IF;

  INSERT INTO public.memories (
    jar_id, sender_name, is_anonymous, content, visibility,
    edit_token_hash, edit_passcode_hash, color, rotation,
    recipient_password_hash, recipient_password_hint, font_key, photo_url
  ) VALUES (
    v_jar.id, trim(p_sender_name), false, trim(p_content), 'contributors',
    encode(extensions.digest(extensions.gen_random_bytes(32), 'sha256'), 'hex'),
    extensions.crypt(p_edit_passcode, extensions.gen_salt('bf', 12)), p_color,
    GREATEST(-8, LEAST(8, p_rotation)),
    v_recip_hash, trim(p_recipient_password_hint), p_font_key, p_photo_url
  ) RETURNING id INTO v_memory_id;

  INSERT INTO public.contributors (jar_id, access_token_hash)
  VALUES (v_jar.id, encode(extensions.digest(p_contributor_token, 'sha256'), 'hex'))
  ON CONFLICT (access_token_hash) DO NOTHING;

  RETURN v_memory_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_memory(text,text,text,text,text,text,smallint,text,text,text,text) TO anon, authenticated;
