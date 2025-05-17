-- This function bypasses RLS by using security definer to insert a client
-- It should be executed in Supabase SQL editor

CREATE OR REPLACE FUNCTION insert_client_direct(
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_status TEXT,
  p_therapist_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with database owner privileges
SET search_path = public
AS $$
DECLARE
  v_client_id UUID;
  v_result JSONB;
BEGIN
  -- Validate that therapist_id matches auth.uid()
  IF p_therapist_id::TEXT != auth.uid()::TEXT THEN
    RAISE EXCEPTION 'Security violation: Cannot create client for another therapist';
  END IF;

  -- Insert the client directly
  INSERT INTO clients (
    first_name,
    last_name,
    email,
    phone,
    status,
    therapist_id,
    created_at,
    updated_at
  )
  VALUES (
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_status,
    p_therapist_id,
    now(),
    now()
  )
  RETURNING id INTO v_client_id;

  -- Get the full client data to return
  SELECT jsonb_build_object(
    'id', id,
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone,
    'status', status, 
    'therapist_id', therapist_id,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM clients
  WHERE id = v_client_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION insert_client_direct TO authenticated;
