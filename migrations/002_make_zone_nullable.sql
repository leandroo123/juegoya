-- Make zone field nullable in matches table
ALTER TABLE matches 
ALTER COLUMN zone DROP NOT NULL;

-- Update existing matches with null zone to have a default value (optional)
-- UPDATE matches SET zone = 'No especificada' WHERE zone IS NULL;
