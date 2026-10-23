-- Add column
ALTER TABLE analyses ADD COLUMN last_updated_content_at TIMESTAMPTZ;

-- Backfill exsting rows
UPDATE analyses SET last_updated_content_at = updated_at WHERE last_updated_content_at IS NULL;

-- Create the trigger function
 CREATE OR REPLACE FUNCTION set_last_updated_content_at_default()
 RETURNS TRIGGER AS $$
 BEGIN
 IF NEW.last_updated_content_at IS NULL THEN
 NEW.last_updated_content_at := NEW.updated_at;
 END IF;
 RETURN NEW;
 END;
 $$ LANGUAGE plpgsql;

 -- Attach Trigger
 CREATE TRIGGER trg_last_updated_content_at
BEFORE INSERT ON analyses
FOR EACH ROW
EXECUTE FUNCTION set_last_updated_content_at_default()
