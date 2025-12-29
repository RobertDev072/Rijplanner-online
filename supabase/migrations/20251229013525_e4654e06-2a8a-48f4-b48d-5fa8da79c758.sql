-- Mockdata voor de hele applicatie
-- Gebruik de bestaande tenant "Rijschool Van Dijk"

DO $$
DECLARE
  v_tenant_id uuid := '11111111-0000-0000-0000-000000000002';
  v_instructor1_id uuid := gen_random_uuid();
  v_instructor2_id uuid := gen_random_uuid();
  v_student1_id uuid := gen_random_uuid();
  v_student2_id uuid := gen_random_uuid();
  v_student3_id uuid := gen_random_uuid();
  v_student4_id uuid := gen_random_uuid();
  v_student5_id uuid := gen_random_uuid();
  v_vehicle1_id uuid := gen_random_uuid();
  v_vehicle2_id uuid := gen_random_uuid();
  v_vehicle3_id uuid := gen_random_uuid();
BEGIN

  -- Instructeurs toevoegen
  INSERT INTO public.users (id, tenant_id, username, pincode, role, name, email, phone, address, avatar_url, theory_passed)
  VALUES 
    (v_instructor1_id, v_tenant_id, 'jan.bakker', '1234', 'instructor', 'Jan Bakker', 'jan.bakker@rijschoolvandijk.nl', '+31612345678', 'Hoofdstraat 15, 1234 AB Amsterdam', NULL, false),
    (v_instructor2_id, v_tenant_id, 'linda.devries', '5678', 'instructor', 'Linda de Vries', 'linda.devries@rijschoolvandijk.nl', '+31687654321', 'Kerkweg 42, 1234 CD Amsterdam', NULL, false)
  ON CONFLICT (id) DO NOTHING;

  -- Leerlingen toevoegen
  INSERT INTO public.users (id, tenant_id, username, pincode, role, name, email, phone, address, avatar_url, theory_passed, theory_passed_at)
  VALUES 
    (v_student1_id, v_tenant_id, 'emma.jansen', '1111', 'student', 'Emma Jansen', 'emma.jansen@gmail.com', '+31698765432', 'Dorpsstraat 8, 1234 EF Amsterdam', NULL, true, NOW() - INTERVAL '30 days'),
    (v_student2_id, v_tenant_id, 'noah.vanderberg', '2222', 'student', 'Noah van der Berg', 'noah.vdb@hotmail.com', '+31611223344', 'Molenweg 22, 1234 GH Amsterdam', NULL, true, NOW() - INTERVAL '14 days'),
    (v_student3_id, v_tenant_id, 'sophie.peters', '3333', 'student', 'Sophie Peters', 'sophie.peters@outlook.com', '+31655667788', 'Stationsstraat 55, 1234 IJ Amsterdam', NULL, false, NULL),
    (v_student4_id, v_tenant_id, 'lucas.visser', '4444', 'student', 'Lucas Visser', 'lucas.v@gmail.com', '+31699887766', 'Parkweg 3, 1234 KL Amsterdam', NULL, true, NOW() - INTERVAL '7 days'),
    (v_student5_id, v_tenant_id, 'mila.degraaf', '5555', 'student', 'Mila de Graaf', 'mila.degraaf@icloud.com', '+31644556677', 'Laan van Eik 17, 1234 MN Amsterdam', NULL, false, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Voertuigen toevoegen
  INSERT INTO public.vehicles (id, tenant_id, brand, model, license_plate, instructor_id)
  VALUES 
    (v_vehicle1_id, v_tenant_id, 'Volkswagen', 'Golf 8', 'AB-123-CD', v_instructor1_id),
    (v_vehicle2_id, v_tenant_id, 'Toyota', 'Yaris Hybrid', 'EF-456-GH', v_instructor2_id),
    (v_vehicle3_id, v_tenant_id, 'Renault', 'Clio V', 'IJ-789-KL', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Lesson credits toevoegen
  INSERT INTO public.lesson_credits (tenant_id, student_id, total_credits, used_credits)
  VALUES 
    (v_tenant_id, v_student1_id, 30, 18),
    (v_tenant_id, v_student2_id, 20, 8),
    (v_tenant_id, v_student3_id, 25, 3),
    (v_tenant_id, v_student4_id, 40, 25),
    (v_tenant_id, v_student5_id, 15, 0)
  ON CONFLICT DO NOTHING;

  -- Lessen toevoegen (mix van statussen en datums)
  -- Voltooide lessen (verleden)
  INSERT INTO public.lessons (tenant_id, instructor_id, student_id, date, start_time, duration, status, vehicle_id, remarks)
  VALUES 
    (v_tenant_id, v_instructor1_id, v_student1_id, CURRENT_DATE - INTERVAL '7 days', '09:00', 60, 'completed', v_vehicle1_id, 'Goed geoefend met rotondes'),
    (v_tenant_id, v_instructor1_id, v_student1_id, CURRENT_DATE - INTERVAL '5 days', '10:00', 90, 'completed', v_vehicle1_id, 'Snelweg gereden, ging prima'),
    (v_tenant_id, v_instructor2_id, v_student2_id, CURRENT_DATE - INTERVAL '3 days', '14:00', 60, 'completed', v_vehicle2_id, 'Inparkeren nog oefenen'),
    (v_tenant_id, v_instructor1_id, v_student4_id, CURRENT_DATE - INTERVAL '2 days', '11:00', 60, 'completed', v_vehicle1_id, 'Voorrang geven gaat goed'),
    (v_tenant_id, v_instructor2_id, v_student1_id, CURRENT_DATE - INTERVAL '1 day', '15:00', 60, 'completed', v_vehicle2_id, 'Bijna examenklaar');

  -- Geaccepteerde lessen (vandaag en toekomst)
  INSERT INTO public.lessons (tenant_id, instructor_id, student_id, date, start_time, duration, status, vehicle_id, remarks)
  VALUES 
    (v_tenant_id, v_instructor1_id, v_student1_id, CURRENT_DATE, '09:00', 60, 'accepted', v_vehicle1_id, NULL),
    (v_tenant_id, v_instructor1_id, v_student2_id, CURRENT_DATE, '10:30', 90, 'accepted', v_vehicle1_id, 'Focus op file rijden'),
    (v_tenant_id, v_instructor2_id, v_student3_id, CURRENT_DATE, '13:00', 60, 'accepted', v_vehicle2_id, 'Eerste les'),
    (v_tenant_id, v_instructor1_id, v_student4_id, CURRENT_DATE + INTERVAL '1 day', '09:00', 60, 'accepted', v_vehicle1_id, NULL),
    (v_tenant_id, v_instructor2_id, v_student2_id, CURRENT_DATE + INTERVAL '1 day', '14:00', 60, 'accepted', v_vehicle2_id, NULL),
    (v_tenant_id, v_instructor1_id, v_student1_id, CURRENT_DATE + INTERVAL '2 days', '10:00', 90, 'accepted', v_vehicle1_id, 'Examensimulatie'),
    (v_tenant_id, v_instructor2_id, v_student5_id, CURRENT_DATE + INTERVAL '3 days', '11:00', 60, 'accepted', v_vehicle2_id, 'Eerste les');

  -- Pending lessen (wachtend op bevestiging)
  INSERT INTO public.lessons (tenant_id, instructor_id, student_id, date, start_time, duration, status, vehicle_id, remarks)
  VALUES 
    (v_tenant_id, v_instructor1_id, v_student3_id, CURRENT_DATE + INTERVAL '4 days', '09:00', 60, 'pending', v_vehicle1_id, NULL),
    (v_tenant_id, v_instructor2_id, v_student4_id, CURRENT_DATE + INTERVAL '5 days', '15:00', 90, 'pending', v_vehicle2_id, 'Wil extra lang oefenen'),
    (v_tenant_id, v_instructor1_id, v_student5_id, CURRENT_DATE + INTERVAL '6 days', '10:00', 60, 'pending', NULL, NULL);

  -- Geannuleerde les
  INSERT INTO public.lessons (tenant_id, instructor_id, student_id, date, start_time, duration, status, vehicle_id, remarks)
  VALUES 
    (v_tenant_id, v_instructor1_id, v_student2_id, CURRENT_DATE - INTERVAL '4 days', '09:00', 60, 'cancelled', v_vehicle1_id, 'Leerling ziek');

END $$;