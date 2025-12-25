-- Add feedback for sergio's lessons
INSERT INTO lesson_feedback (tenant_id, lesson_id, instructor_id, student_id, rating, notes, topics_practiced)
VALUES 
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', 'c515dd2f-cf8d-4f58-8da8-0179fed2daf7', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6372799a-4294-4deb-a447-5e6cb9bb970a', 4, 'Goede eerste les! Schakelen ging snel goed.', ARRAY['Kennismaking', 'Schakelen', 'Sturen']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', 'db502de0-362e-414d-beb2-323a2c76a543', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6372799a-4294-4deb-a447-5e6cb9bb970a', 5, 'Uitstekend op de snelweg! Invoegen en uitvoegen ging prima.', ARRAY['Snelweg', 'Invoegen', 'Spiegels', 'Snelheid']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '6e755891-2c03-4127-a73e-f5386ff82402', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6372799a-4294-4deb-a447-5e6cb9bb970a', 4, 'Parkeren gaat steeds beter. Fileparkeren nog even oefenen.', ARRAY['Parkeren', 'Achteruit rijden', 'Sturen']),

-- Add feedback for soraya's lessons  
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '2b3ba6c5-93cb-4920-9528-192a2b323d3c', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', 3, 'Eerste les, nog wat zenuwachtig maar dat komt goed. Focus op ontspanning.', ARRAY['Kennismaking', 'Koppeling', 'Gas geven']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '1ed1fe78-61ad-494a-b46d-79a39893d506', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', 4, 'Rotondes gaan nu veel beter! Goed kijkgedrag.', ARRAY['Rotondes', 'Voorrang', 'Kijkgedrag']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '7fe7579a-7a8f-4172-93b0-30195b32c157', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', 4, 'Prima gereden in het centrum. Let nog even op fietsers links.', ARRAY['Centrum rijden', 'Fietsers', 'Verkeerslichten']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '22e29a8f-9b44-4130-a0ce-a16bc2e49a64', '72edb322-a52c-40c3-bf75-fa609c0525c6', '22397a3d-3c05-4b95-b231-3feb17bbc588', 5, 'Fantastische examentraining! Je bent er helemaal klaar voor.', ARRAY['Examentraining', 'Voorrang', 'Rotondes', 'Parkeren', 'Snelweg']);

-- Update some existing lessons with vehicle_id
UPDATE lessons SET vehicle_id = '7fc3a6f9-a500-42db-9328-cd89a158aba1' WHERE date >= '2025-12-25' AND status IN ('pending', 'accepted');