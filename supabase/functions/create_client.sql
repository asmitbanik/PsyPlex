-- Function to create a client with proper RLS security
-- This must be run in your Supabase SQL editor
-- This stored procedure ensures that the therapist_id is always set to current user's id

create or replace function create_client_for_therapist(client_data jsonb)
returns jsonb
language plpgsql
security definer -- This runs with the privileges of the function creator
set search_path = public
as $$
declare
  new_client_id uuid;
  client_record jsonb;
begin
  -- Check if user is authenticated
  if auth.uid() is null then
    raise exception 'Authentication required to create client';
  end if;

  -- Force therapist_id to be the current user's ID regardless of input
  -- This ensures RLS policies are always satisfied
  client_data = client_data || jsonb_build_object('therapist_id', auth.uid());
  
  -- Insert the client record
  insert into clients (
    first_name, 
    last_name, 
    email, 
    phone, 
    status, 
    therapist_id,
    created_at,
    updated_at
  )
  values (
    client_data->>'first_name',
    client_data->>'last_name',
    client_data->>'email',
    client_data->>'phone',
    client_data->>'status',
    (client_data->>'therapist_id')::uuid, -- explicitly cast to UUID
    now(),
    now()
  )
  returning id into new_client_id;
  
  -- Retrieve the newly created client
  select jsonb_build_object(
    'id', id,
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone,
    'status', status,
    'therapist_id', therapist_id,
    'created_at', created_at,
    'updated_at', updated_at
  ) into client_record
  from clients
  where id = new_client_id;
  
  return client_record;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function create_client_for_therapist(jsonb) to authenticated;

-- Verify RLS policies on clients table
-- Make sure your clients table has these policies:

-- 1. Therapists can only see their own clients
comment on table clients is 'Client records with row-level security enabled';

-- 2. Create a policy for insert (if not already exists)
drop policy if exists "Therapists can only create clients for themselves" on clients;
create policy "Therapists can only create clients for themselves" on clients
for insert 
to authenticated
with check (therapist_id = auth.uid());

-- 3. Create a policy for select (if not already exists)
drop policy if exists "Therapists can only view their own clients" on clients;
create policy "Therapists can only view their own clients" on clients
for select 
to authenticated
using (therapist_id = auth.uid());

-- 4. Create a policy for update (if not already exists)
drop policy if exists "Therapists can only update their own clients" on clients;
create policy "Therapists can only update their own clients" on clients
for update
to authenticated
using (therapist_id = auth.uid());

-- 5. Create a policy for delete (if not already exists)
drop policy if exists "Therapists can only delete their own clients" on clients;
create policy "Therapists can only delete their own clients" on clients
for delete
to authenticated
using (therapist_id = auth.uid());
