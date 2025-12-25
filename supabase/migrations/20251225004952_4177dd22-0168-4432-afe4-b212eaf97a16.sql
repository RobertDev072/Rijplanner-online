-- Add feedback for completed lessons
INSERT INTO lesson_feedback (tenant_id, lesson_id, instructor_id, student_id, rating, notes, topics_practiced)
VALUES 
  -- Feedback for lorena's lessons
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '07ef008f-dde9-4de1-b738-d19c613ba960', '72edb322-a52c-40c3-bf75-fa609c0525c6', '3596f985-9696-4fe7-a42a-934ce81415bb', 4, 'Goed bezig! Sturen gaat al veel beter. Let wel nog op je spiegels.', ARRAY['Sturen', 'Spiegels', 'Schakelen']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', 'd5e5ccb5-8bb8-42e3-87f1-d1396863d360', '72edb322-a52c-40c3-bf75-fa609c0525c6', '3596f985-9696-4fe7-a42a-934ce81415bb', 5, 'Uitstekende examentraining! Je bent er helemaal klaar voor.', ARRAY['Examentraining', 'Rotondes', 'Voorrang', 'Invoegen']),
  
  -- Feedback for sandro's lesson
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '93ce3991-5904-4816-9bca-78bedef30c8f', '72edb322-a52c-40c3-bf75-fa609c0525c6', '77101c5c-e23a-41df-a262-fa1c82013a6a', 3, 'Centrum rijden is nog lastig. Volgende keer meer aandacht voor fietsers.', ARRAY['Centrum rijden', 'Verkeersborden', 'Fietsers']),
  
  -- Feedback for robert's lessons
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '7271b1e2-53fa-4082-8152-e5a66b1cc22d', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6e13288b-4bfc-4c2f-ac42-886805460cfb', 4, 'Goede eerste les! Basis schakelen en sturen gaat prima.', ARRAY['Kennismaking', 'Schakelen', 'Sturen', 'Koppeling']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '1ff00faf-5e07-48fa-99e8-0348ce361006', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6e13288b-4bfc-4c2f-ac42-886805460cfb', 5, 'Super gedaan vandaag! Rotondes gaan nu veel beter.', ARRAY['Rotondes', 'Voorrang', 'Rijstroken']),
  ('72112e3d-1441-4ed1-9e55-abfab31083fa', '1fb55f98-bafb-49a9-9bc7-c39d49220e81', '72edb322-a52c-40c3-bf75-fa609c0525c6', '6e13288b-4bfc-4c2f-ac42-886805460cfb', 4, 'Goed gereden in het donker. Nog even letten op afstand houden.', ARRAY['Donker rijden', 'Koplampen', 'Afstand houden']);