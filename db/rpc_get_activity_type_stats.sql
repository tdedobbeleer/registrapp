-- RPC function to get activity type stats
CREATE OR REPLACE FUNCTION get_activity_type_stats(start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
  name TEXT,
  average NUMERIC,
  median DOUBLE PRECISION,
  min INTEGER,
  max INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    at.name,
    COALESCE(AVG(sub.reg_count), 0) as average,
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sub.reg_count), 0.0) as median,
    COALESCE(MIN(sub.reg_count), 0) as min,
    COALESCE(MAX(sub.reg_count), 0) as max
  FROM (
    SELECT
      a.activity_type_id,
      COUNT(r.participant_id)::INTEGER as reg_count
    FROM activities a
    LEFT JOIN registrations r ON r.activity_id = a.id
    WHERE (start_date IS NULL OR a.date >= start_date)
      AND (end_date IS NULL OR a.date <= end_date)
    GROUP BY a.id, a.activity_type_id
  ) sub
  RIGHT JOIN activity_types at ON at.id = sub.activity_type_id
  GROUP BY at.id, at.name
  ORDER BY at.name;
END;
$$ LANGUAGE plpgsql;