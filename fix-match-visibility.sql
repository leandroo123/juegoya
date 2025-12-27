/* Fix all future matches to be visible */
UPDATE matches
SET status = 'open'
WHERE starts_at >= NOW()
  AND (status IS NULL OR status != 'open');

/* Verify the fix */
SELECT 
  id,
  sport,
  status,
  starts_at,
  organizer_id
FROM matches
WHERE status = 'open' 
  AND starts_at >= NOW()
ORDER BY starts_at;
