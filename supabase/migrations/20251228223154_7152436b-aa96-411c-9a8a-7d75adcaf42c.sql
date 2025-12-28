-- Insert a second test driving school
INSERT INTO public.tenants (id, name, primary_color, secondary_color, status, whatsapp_number)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rijschool Amsterdam Test', '#2563EB', '#16A34A', 'active', '+31612345678')
ON CONFLICT (id) DO NOTHING;

-- Insert test users for the new driving school
INSERT INTO public.users (id, username, name, role, tenant_id, pincode, email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'testadmin', 'Test Admin Amsterdam', 'admin', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1234', 'testadmin@test.nl'),
  ('22222222-2222-2222-2222-222222222222', 'testinstructor', 'Test Instructeur Jan', 'instructor', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1234', 'jan@test.nl'),
  ('33333333-3333-3333-3333-333333333333', 'teststudent1', 'Test Leerling Piet', 'student', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1234', 'piet@test.nl'),
  ('44444444-4444-4444-4444-444444444444', 'teststudent2', 'Test Leerling Anna', 'student', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1234', 'anna@test.nl')
ON CONFLICT (id) DO NOTHING;

-- Insert test vehicle
INSERT INTO public.vehicles (id, brand, model, license_plate, instructor_id, tenant_id)
VALUES ('55555555-5555-5555-5555-555555555555', 'Ford', 'Fiesta', 'ZZ-999-ZZ', '22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
ON CONFLICT (id) DO NOTHING;

-- Insert test lesson credits
INSERT INTO public.lesson_credits (id, student_id, tenant_id, total_credits, used_credits)
VALUES 
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 15, 3),
  ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 20, 5)
ON CONFLICT (id) DO NOTHING;

-- Insert test lessons
INSERT INTO public.lessons (id, instructor_id, student_id, tenant_id, date, start_time, duration, status, remarks, vehicle_id)
VALUES 
  ('88888888-8888-8888-8888-888888888881', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-12-30', '09:00:00', 60, 'accepted', 'Eerste les', '55555555-5555-5555-5555-555555555555'),
  ('88888888-8888-8888-8888-888888888882', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-12-30', '10:30:00', 90, 'pending', 'Snelweg rijden', '55555555-5555-5555-5555-555555555555'),
  ('88888888-8888-8888-8888-888888888883', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-12-31', '14:00:00', 60, 'accepted', 'Parkeren oefenen', '55555555-5555-5555-5555-555555555555'),
  ('88888888-8888-8888-8888-888888888884', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-01-02', '11:00:00', 120, 'pending', 'Examentraining', '55555555-5555-5555-5555-555555555555')
ON CONFLICT (id) DO NOTHING;

-- Insert test feedback
INSERT INTO public.lesson_feedback (id, lesson_id, instructor_id, student_id, tenant_id, rating, notes, topics_practiced)
VALUES 
  ('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888881', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Goede start! Schakelen gaat prima.', ARRAY['Kennismaking', 'Schakelen', 'Sturen']),
  ('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888883', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Uitstekend! Parkeren is nu perfect.', ARRAY['Parkeren', 'Achteruit', 'Spiegels'])
ON CONFLICT (id) DO NOTHING;