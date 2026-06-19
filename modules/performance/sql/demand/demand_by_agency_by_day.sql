-- DEMAND BY AGENCY BY DAY
-- Automatic pipeline to sync demand by agency by day metrics
-- in realtime using ClickHouse and a materialized view.

-- 1. Create the destination table

CREATE TABLE performance.demand_by_agency_by_day(
   calendar_date Date,
   agency_id String,
   qty UInt64
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(calendar_date)
ORDER BY (calendar_date, agency_id);


-- 2. Create the materialized view

CREATE MATERIALIZED VIEW demand_by_agency_by_day_mv
TO demand_by_agency_by_day
AS
SELECT
	toDate(created_at) AS calendar_date,
	agency_id,
	COUNT() AS qty
FROM simplified_apex.validations
GROUP BY calendar_date, agency_id;


-- 3. Force sync of data into the destination table.
-- Run this query on a regular interval to ensure the data is always up to date,
-- even if the materialized view skipped a few validations.

INSERT INTO performance.demand_by_agency_by_day
SELECT
	toDate(created_at) AS calendar_date,
	agency_id,
	COUNT() AS qty
FROM simplified_apex.validations
GROUP BY calendar_date, agency_id;