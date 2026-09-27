-- Additive, non-destructive: remembers the last calendar day (UTC) on which
-- the "Hadith of the day" push was sent, so the daily cron never notifies the
-- same user twice on the same day. Existing rows keep NULL (= never sent).
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_hadith_sent_on DATE;
