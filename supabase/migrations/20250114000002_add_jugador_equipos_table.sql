
-- Add deporte_id column to posiciones table
ALTER TABLE posiciones ADD COLUMN deporte_id uuid REFERENCES deportes(id);

-- Update existing positions with appropriate sport associations
-- You'll need to manually assign sports to existing positions based on your data
-- For now, we'll leave them as NULL and you can update them manually or we can do it programmatically

-- Add index for better performance
CREATE INDEX idx_posiciones_deporte_id ON posiciones(deporte_id);
