-- Add 'completed' to the lesson_status enum
ALTER TYPE lesson_status ADD VALUE IF NOT EXISTS 'completed';