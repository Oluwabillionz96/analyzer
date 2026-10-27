CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    hits INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY(bucket, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window on rate_limits(window_start);
