-- Add test vehicles
INSERT INTO vehicles (tenant_id, instructor_id, brand, model, license_plate)
VALUES 
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', 'Volkswagen', 'Polo', 'XX-123-YY'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', 'Toyota', 'Yaris', 'AB-456-CD');

-- Add completed lessons for testing feedback
INSERT INTO lessons (tenant_id, instructor_id, student_id, date, start_time, duration, status, remarks)
VALUES 
  -- Completed lessons for robert
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6e13288b-4bfc-4c2f-ac42-886805460cfb', '2025-12-20', '10:00:00', 60, 'completed', 'Eerste les, kennismaking'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6e13288b-4bfc-4c2f-ac42-886805460cfb', '2025-12-22', '14:00:00', 90, 'completed', 'Station Alkmaar'),
  
  -- Completed lessons for lorena
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '3596f985-9696-4fe7-a42a-934ce81415bb', '2025-12-18', '09:00:00', 60, 'completed', 'Thuis ophalen'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '3596f985-9696-4fe7-a42a-934ce81415bb', '2025-12-21', '11:00:00', 120, 'completed', 'Examentraining'),
  
  -- Completed lesson for sandro
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '77101c5c-e23a-41df-a262-fa1c82013a6a', '2025-12-19', '15:00:00', 60, 'completed', 'Centrum'),
  
  -- Accepted/Pending lessons for upcoming schedule
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6e13288b-4bfc-4c2f-ac42-886805460cfb', '2025-12-27', '10:00:00', 60, 'accepted', 'Thuis ophalen'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '3596f985-9696-4fe7-a42a-934ce81415bb', '2025-12-28', '14:00:00', 90, 'pending', 'Station'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '77101c5c-e23a-41df-a262-fa1c82013a6a', '2025-12-29', '11:00:00', 60, 'pending', 'School');