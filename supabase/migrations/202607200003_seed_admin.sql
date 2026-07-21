-- Script tạo Admin cứng và Khởi tạo Lọ sao đầu tiên
-- Chạy script này trong Supabase SQL Editor

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  existing_user_id uuid;
BEGIN
  -- 1. Kiểm tra xem user đã tồn tại chưa
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'Itentad.work@gmail.com';
  
  IF existing_user_id IS NULL THEN
    -- Tạo User mới với email đã được xác nhận (bỏ qua bước gửi email)
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'Itentad.work@gmail.com', crypt('adminbest@123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );
    
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_user_id::text, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, 'Itentad.work@gmail.com')::jsonb, 'email', now(), now(), now()
    );
  ELSE
    new_user_id := existing_user_id;
    -- Cập nhật lại mật khẩu nếu user đã tồn tại
    UPDATE auth.users SET encrypted_password = crypt('adminbest@123', gen_salt('bf')), email_confirmed_at = now() WHERE id = new_user_id;
  END IF;

  -- 2. Tạo Lọ Sao Mặc Định cho admin này (nếu chưa có lọ nào)
  IF NOT EXISTS (SELECT 1 FROM public.jars LIMIT 1) THEN
    INSERT INTO public.jars (
      slug, owner_id, recipient_name, title, intro, status, recipient_passcode_hash, created_at
    ) VALUES (
      'gift', new_user_id, 'Bạn của tôi', 'A little jar of your happy moments', 'Chúng mình đã lưu giữ những khoảnh khắc tuyệt vời này dành cho cậu.', 'collecting', '', now()
    );
  END IF;
END $$;
