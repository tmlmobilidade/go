-- DEMAND BY AGENCY BY DAY
-- Automatic pipeline to sync demand by agency by day metrics
-- in realtime using ClickHouse and a materialized view.

-- 1. Create the destination table

CREATE TABLE performance.demand_by_agency_by_operational_date(
   operational_date UInt32,
   agency_id String,
   qty UInt64
) ENGINE = SummingMergeTree()
PARTITION BY intDiv(operational_date, 100) -- yyyyLLdd -> yyyyMM
ORDER BY (operational_date, agency_id);


-- 2. Create the materialized view

CREATE MATERIALIZED VIEW performance.demand_by_agency_by_operational_date_mv
TO performance.demand_by_agency_by_operational_date
AS
SELECT
    toYYYYMMDD(toTimeZone(created_at, 'Europe/Lisbon') - INTERVAL 4 HOUR) AS operational_date,
    agency_id,
    COUNT() AS qty
FROM simplified_apex.validations
WHERE is_passenger = true
GROUP BY operational_date, agency_id;


-- 3. Force sync of data into the destination table.
-- Run this query on a regular interval to ensure the data is always up to date,
-- even if the materialized view skipped a few validations.

INSERT INTO performance.demand_by_agency_by_operational_date
WITH toTimeZone(created_at, 'Europe/Lisbon') AS local_created_at
SELECT
    toYYYYMMDD(local_created_at - INTERVAL 4 HOUR) AS operational_date,
    agency_id,
    COUNT() AS qty
FROM simplified_apex.validations
WHERE is_passenger = true
GROUP BY operational_date, agency_id;