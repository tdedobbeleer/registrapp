-- This view shows the count of registrations per participant and per activity type
-- It can be used to rank registrations by user and activity type

CREATE OR REPLACE VIEW registrations_by_activity_type AS
SELECT 
    r.participant_id,
    a.activity_type_id,
    COUNT(r.participant_id) AS registration_count
FROM 
    registrations r
JOIN 
    activities a ON r.activity_id = a.id
GROUP BY 
    r.participant_id,
    a.activity_type_id
ORDER BY 
    r.participant_id,
    a.activity_type_id;

-- To query this view:
-- SELECT * FROM registrations_by_activity_type;

-- To get registrations per participant (all activity types combined):
-- SELECT participant_id, SUM(registration_count) as total_registrations 
-- FROM registrations_by_activity_type 
-- GROUP BY participant_id;

-- To get registrations per activity type (all participants combined):
-- SELECT activity_type_id, SUM(registration_count) as total_registrations 
-- FROM registrations_by_activity_type 
-- GROUP BY activity_type_id;
-- alter a security_definer view to be security_invoker
alter view registrations_by_activity_type
set (security_invoker = true);
grant all on table registrations_by_activity_type to authenticated; 
