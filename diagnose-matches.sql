/* Check all matches */
SELECT 
  id,
  sport,
  status,
  starts_at,
  created_at,
  organizer_id,
  total_slots,
  CASE 
    WHEN starts_at < NOW() THEN 'PAST'
    WHEN status != 'open' THEN 'NOT OPEN'
    ELSE 'SHOULD BE VISIBLE'
  END as visibility_status
FROM matches
ORDER BY created_at DESC
LIMIT 10;
