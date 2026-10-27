ALTER TABLE analyses RENAME COLUMN url TO origin;
CREATE INDEX idx_analyses_origin on analyses(origin);

UPDATE analyses
SET origin = substring(origin from '^(https?://[^/]+)')
WHERE origin ~ '^https?://';