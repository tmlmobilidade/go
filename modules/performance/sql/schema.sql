CREATE DATABASE IF NOT EXISTS temp_performance;

-- Values stay typed and queryable; the API only rebuilds the existing JSON shape.
CREATE TABLE IF NOT EXISTS temp_performance.metric_rows
(
    metric LowCardinality(String),
    run_id UUID,
    output_date Date,
    properties Map(String, String),
    path Array(String),
    numbers Map(String, Float64),
    strings Map(String, Nullable(String)),
    booleans Map(String, Bool),
    scalar Nullable(Float64),
    created_at DateTime64(3) DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(output_date)
ORDER BY (metric, output_date, run_id);

CREATE TABLE IF NOT EXISTS temp_performance.refreshes
(
    metric LowCardinality(String),
    run_id UUID,
    range_start Date,
    range_end Date,
    reference_at UInt64,
    published_at DateTime64(6) DEFAULT now64(6)
)
ENGINE = MergeTree
ORDER BY (metric, range_start, reference_at, run_id);

CREATE TABLE IF NOT EXISTS temp_performance.agencies
(
    run_id UUID,
    agency_id String,
    agency_code String,
    price_per_km Float64,
    created_at DateTime64(3) DEFAULT now64(3)
)
ENGINE = MergeTree ORDER BY (run_id, agency_id);

CREATE TABLE IF NOT EXISTS temp_performance.calendar
(
    run_id UUID,
    date Date,
    day_type String,
    holiday String,
    period String,
    notes Nullable(String),
    created_at DateTime64(3) DEFAULT now64(3)
)
ENGINE = MergeTree ORDER BY (run_id, date);

ALTER TABLE temp_performance.metric_rows ADD COLUMN IF NOT EXISTS created_at DateTime64(3) DEFAULT now64(3);
ALTER TABLE temp_performance.agencies ADD COLUMN IF NOT EXISTS created_at DateTime64(3) DEFAULT now64(3);
ALTER TABLE temp_performance.calendar ADD COLUMN IF NOT EXISTS created_at DateTime64(3) DEFAULT now64(3);

-- Range markers replace even an empty result. An older, slower run cannot win.
CREATE OR REPLACE VIEW temp_performance.rows_at AS
SELECT r.metric AS metric, r.run_id AS run_id, r.output_date AS output_date,
       r.properties AS properties, r.path AS path, r.numbers AS numbers,
       r.strings AS strings, r.booleans AS booleans, r.scalar AS scalar,
       f.reference_at AS generated_at
FROM temp_performance.metric_rows AS r
INNER JOIN
(
    SELECT metric, output_date,
           argMax(run_id, tuple(reference_at, toString(run_id))) AS run_id
    FROM
    (
        SELECT metric, run_id, reference_at,
               addDays(range_start, arrayJoin(range(toUInt32(dateDiff('day', range_start, range_end) + 1)))) AS output_date
        FROM temp_performance.refreshes
        WHERE run_id IN {input_runs:Array(UUID)}
    )
    GROUP BY metric, output_date
) AS current ON r.metric = current.metric AND r.output_date = current.output_date AND r.run_id = current.run_id
INNER JOIN temp_performance.refreshes AS f ON r.run_id = f.run_id AND r.metric = f.metric
WHERE r.run_id IN {input_runs:Array(UUID)};

-- Keep everything published recently and the snapshots that were current at the cutoff.
-- A long-lived last-good result survives indefinitely, even during an extended outage.
CREATE OR REPLACE VIEW temp_performance.retained_runs AS
SELECT run_id FROM temp_performance.refreshes
WHERE published_at >= fromUnixTimestamp64Milli({cutoff:Int64})
UNION DISTINCT
SELECT argMax(run_id, tuple(reference_at, toString(run_id))) AS run_id
FROM
(
    SELECT metric, run_id, reference_at,
           addDays(range_start, arrayJoin(range(toUInt32(dateDiff('day', range_start, range_end) + 1)))) AS output_date
    FROM temp_performance.refreshes
    WHERE published_at < fromUnixTimestamp64Milli({cutoff:Int64})
)
GROUP BY metric, output_date;
