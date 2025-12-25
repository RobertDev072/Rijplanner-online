-- Add vehicle_id to lessons table for vehicle tracking
ALTER TABLE lessons ADD COLUMN vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL;

-- Add more historical test data with feedback for all students

-- More completed lessons for sergio
INSERT INTO lessons (tenant_id, instructor_id, student_id, date, start_time, duration, status, remarks)
VALUES 
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6372799a-4294-4deb-a447-5e6cb9bb970a', '2025-12-10', '10:00:00', 60, 'completed', 'Eerste les'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6372799a-4294-4deb-a447-5e6cb9bb970a', '2025-12-14', '14:00:00', 90, 'completed', 'Snelweg oefenen'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6372799a-4294-4deb-a447-5e6cb9bb970a', '2025-12-17', '11:00:00', 60, 'completed', 'Parkeren'),

-- More completed lessons for soraya
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', '2025-12-08', '09:00:00', 60, 'completed', 'Kennismaking'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', '2025-12-12', '15:00:00', 90, 'completed', 'Rotondes'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', '2025-12-16', '13:00:00', 60, 'completed', 'Centrum'),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', '2025-12-20', '10:00:00', 120, 'completed', 'Examentraining');