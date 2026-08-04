/*
 * Benchmarks the validation-derived demand metrics currently produced by
 * performance/apps/sync-metrics-* against:
 *
 *   performance.passenger_demand_by_dimensions_by_day
 *
 * Run the whole file in clickhouse-client or your ClickHouse SQL console.
 * Every metric query writes no result rows (FORMAT Null), but ClickHouse still
 * executes the complete aggregation. The final query reports duration, rows
 * read, bytes read, and peak memory for the most recent execution of each tag.
 * Remove `FORMAT Null` from an individual query when you want to inspect its
 * result.
 *
 * Scope:
 * - Includes all legacy metrics derived from validations/is_passenger.
 * - Excludes rides-derived pattern/hour demand and failed-circulation impact.
 * - Includes unknown dimension values, matching the new aggregate's grain.
 *
 * Calendar limitation:
 * The aggregate table has no day_type/calendar attribute. The two metrics that
 * require it use ISO weekday as an approximation:
 *   1 = Monday-Friday, 2 = Saturday, 3 = Sunday.
 * Public holidays are therefore not classified as day type 3. Join a proper
 * ClickHouse calendar dimension in `daily_classified` for exact legacy output.
 */

SET param_definition_version = 'passenger-demand-v2';
SET param_start_date = 20240101;
SET param_end_date = 20260804;

SET log_queries = 1;
SET use_query_cache = 0;

/* ------------------------------------------------------------------------- */
/* Base demand metrics                                                       */
/* ------------------------------------------------------------------------- */

-- 01. demand_by_agency_by_day
SELECT
    operational_date,
    agency_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, agency_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_agency_by_day'
FORMAT Null;

-- 02. demand_by_agency_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    agency_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, agency_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_agency_by_month'
FORMAT Null;

-- 03. demand_by_agency_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    agency_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, agency_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_agency_by_year'
FORMAT Null;

-- 04. demand_by_line_by_day
SELECT
    operational_date,
    line_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, line_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_line_by_day'
FORMAT Null;

-- 05. demand_by_line_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    line_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, line_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_line_by_month'
FORMAT Null;

-- 06. demand_by_line_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    line_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, line_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_line_by_year'
FORMAT Null;

-- 07. demand_by_pattern_by_day
SELECT
    operational_date,
    pattern_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, pattern_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_pattern_by_day'
FORMAT Null;

-- 08. demand_by_pattern_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    pattern_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, pattern_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_pattern_by_month'
FORMAT Null;

-- 09. demand_by_pattern_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    pattern_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, pattern_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_pattern_by_year'
FORMAT Null;

/* ------------------------------------------------------------------------- */
/* Demand by product                                                         */
/* ------------------------------------------------------------------------- */

-- 10. demand_by_product_by_agency_by_day
SELECT
    operational_date,
    agency_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, agency_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_agency_by_day'
FORMAT Null;

-- 11. demand_by_product_by_agency_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    agency_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, agency_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_agency_by_month'
FORMAT Null;

-- 12. demand_by_product_by_agency_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    agency_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, agency_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_agency_by_year'
FORMAT Null;

-- 13. demand_by_product_by_line_by_day
SELECT
    operational_date,
    line_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, line_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_line_by_day'
FORMAT Null;

-- 14. demand_by_product_by_line_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    line_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, line_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_line_by_month'
FORMAT Null;

-- 15. demand_by_product_by_line_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    line_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, line_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_line_by_year'
FORMAT Null;

-- 16. demand_by_product_by_pattern_by_day
SELECT
    operational_date,
    pattern_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, pattern_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_pattern_by_day'
FORMAT Null;

-- 17. demand_by_product_by_pattern_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    pattern_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, pattern_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_pattern_by_month'
FORMAT Null;

-- 18. demand_by_product_by_pattern_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    pattern_id,
    product_id,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, pattern_id, product_id
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_product_by_pattern_by_year'
FORMAT Null;

/* ------------------------------------------------------------------------- */
/* Demand by passenger/product category                                      */
/* ------------------------------------------------------------------------- */

-- 19. demand_by_category_by_agency_by_day
SELECT
    operational_date,
    agency_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, agency_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_agency_by_day'
FORMAT Null;

-- 20. demand_by_category_by_agency_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    agency_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, agency_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_agency_by_month'
FORMAT Null;

-- 21. demand_by_category_by_agency_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    agency_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, agency_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_agency_by_year'
FORMAT Null;

-- 22. demand_by_category_by_line_by_day
SELECT
    operational_date,
    line_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, line_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_line_by_day'
FORMAT Null;

-- 23. demand_by_category_by_line_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    line_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, line_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_line_by_month'
FORMAT Null;

-- 24. demand_by_category_by_line_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    line_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, line_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_line_by_year'
FORMAT Null;

-- 25. demand_by_category_by_pattern_by_day
SELECT
    operational_date,
    pattern_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY operational_date, pattern_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_pattern_by_day'
FORMAT Null;

-- 26. demand_by_category_by_pattern_by_month
SELECT
    intDiv(operational_date, 100) AS month,
    pattern_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY month, pattern_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_pattern_by_month'
FORMAT Null;

-- 27. demand_by_category_by_pattern_by_year
SELECT
    intDiv(operational_date, 10000) AS year,
    pattern_id,
    category,
    sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
    definition_version = {definition_version:String}
    AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
GROUP BY year, pattern_id, category
SETTINGS log_comment = 'performance-demand-benchmark:demand_by_category_by_pattern_by_year'
FORMAT Null;

/* ------------------------------------------------------------------------- */
/* Derived demand metrics                                                    */
/* ------------------------------------------------------------------------- */

-- 28. top_demand_by_agency
-- One record day and record month per agency, plus the network-wide records.
WITH
    daily_by_agency AS
    (
        SELECT
            operational_date,
            agency_id,
            sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
        WHERE
            definition_version = {definition_version:String}
            AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
        GROUP BY operational_date, agency_id
    ),
    monthly_by_agency AS
    (
        SELECT
            intDiv(operational_date, 100) AS month,
            agency_id,
            sum(demand) AS demand
        FROM daily_by_agency
        GROUP BY month, agency_id
    ),
    ranked_daily_by_agency AS
    (
        SELECT
            *,
            row_number() OVER (PARTITION BY agency_id ORDER BY demand DESC, operational_date ASC) AS position
        FROM daily_by_agency
    ),
    ranked_monthly_by_agency AS
    (
        SELECT
            *,
            row_number() OVER (PARTITION BY agency_id ORDER BY demand DESC, month ASC) AS position
        FROM monthly_by_agency
    ),
    daily_network AS
    (
        SELECT operational_date, sum(demand) AS demand
        FROM daily_by_agency
        GROUP BY operational_date
    ),
    monthly_network AS
    (
        SELECT month, sum(demand) AS demand
        FROM monthly_by_agency
        GROUP BY month
    ),
    ranked_daily_network AS
    (
        SELECT *, row_number() OVER (ORDER BY demand DESC, operational_date ASC) AS position
        FROM daily_network
    ),
    ranked_monthly_network AS
    (
        SELECT *, row_number() OVER (ORDER BY demand DESC, month ASC) AS position
        FROM monthly_network
    )
SELECT *
FROM
(
    SELECT
        'agency' AS scope,
        'day' AS period_type,
        agency_id,
        toString(operational_date) AS period,
        demand
    FROM ranked_daily_by_agency
    WHERE position = 1

    UNION ALL

    SELECT 'agency', 'month', agency_id, toString(month), demand
    FROM ranked_monthly_by_agency
    WHERE position = 1

    UNION ALL

    SELECT 'network', 'day', 'all', toString(operational_date), demand
    FROM ranked_daily_network
    WHERE position = 1

    UNION ALL

    SELECT 'network', 'month', 'all', toString(month), demand
    FROM ranked_monthly_network
    WHERE position = 1
)
SETTINGS log_comment = 'performance-demand-benchmark:top_demand_by_agency'
FORMAT Null;

-- 29. top_demand_by_agency_by_day_type
-- Approximation: weekday=1, Saturday=2, Sunday=3; holidays need a calendar join.
WITH
    daily_by_agency AS
    (
        SELECT
            operational_date,
            agency_id,
            sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
        WHERE
            definition_version = {definition_version:String}
            AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
        GROUP BY operational_date, agency_id
        HAVING demand > 0
    ),
    daily_classified AS
    (
        SELECT
            *,
            multiIf(
                toDayOfWeek(YYYYMMDDToDate(operational_date)) <= 5, '1',
                toDayOfWeek(YYYYMMDDToDate(operational_date)) = 6, '2',
                '3'
            ) AS day_type
        FROM daily_by_agency
    ),
    ranked_by_agency AS
    (
        SELECT
            *,
            row_number() OVER (
                PARTITION BY agency_id, day_type
                ORDER BY demand DESC, operational_date ASC
            ) AS position
        FROM daily_classified
    ),
    daily_network AS
    (
        SELECT
            operational_date,
            day_type,
            sum(demand) AS demand
        FROM daily_classified
        GROUP BY operational_date, day_type
    ),
    ranked_network AS
    (
        SELECT
            *,
            row_number() OVER (
                PARTITION BY day_type
                ORDER BY demand DESC, operational_date ASC
            ) AS position
        FROM daily_network
    )
SELECT *
FROM
(
    SELECT
        'agency' AS scope,
        agency_id,
        day_type,
        operational_date,
        demand,
        position
    FROM ranked_by_agency
    WHERE position <= 5

    UNION ALL

    SELECT 'network', 'all', day_type, operational_date, demand, position
    FROM ranked_network
    WHERE position <= 5
)
SETTINGS log_comment = 'performance-demand-benchmark:top_demand_by_agency_by_day_type'
FORMAT Null;

-- 30. mean_demand_by_line_by_month
-- Approximation: weekday=1, Saturday=2, Sunday=3; holidays need a calendar join.
WITH
    daily_by_line AS
    (
        SELECT
            operational_date,
            line_id,
            sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
        WHERE
            definition_version = {definition_version:String}
            AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
        GROUP BY operational_date, line_id
    ),
    daily_classified AS
    (
        SELECT
            intDiv(operational_date, 100) AS month,
            line_id,
            multiIf(
                toDayOfWeek(YYYYMMDDToDate(operational_date)) <= 5, 'weekday',
                toDayOfWeek(YYYYMMDDToDate(operational_date)) = 6, 'saturday',
                'sunday'
            ) AS day_type,
            demand
        FROM daily_by_line
    )
SELECT *
FROM
(
    SELECT
        month,
        line_id,
        day_type,
        sum(demand) AS demand,
        count() AS observed_days,
        round(avg(demand)) AS mean_daily_demand
    FROM daily_classified
    GROUP BY month, line_id, day_type

    UNION ALL

    SELECT
        month,
        line_id,
        'total',
        sum(demand),
        count(),
        round(avg(demand))
    FROM daily_classified
    GROUP BY month, line_id
)
SETTINGS log_comment = 'performance-demand-benchmark:mean_demand_by_line_by_month'
FORMAT Null;

-- 31. top_mean_demand_by_line_by_month
-- Mirrors the legacy implementation: the current month's total is compared
-- with the average monthly total for the same line, year-to-date (inclusive).
WITH
    monthly_by_line AS
    (
        SELECT
            intDiv(operational_date, 100) AS month,
            line_id,
            sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
        WHERE
            definition_version = {definition_version:String}
            AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
        GROUP BY month, line_id
    ),
    with_ytd_average AS
    (
        SELECT
            *,
            avg(demand) OVER (
                PARTITION BY line_id, intDiv(month, 100)
                ORDER BY month
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS ytd_monthly_average
        FROM monthly_by_line
    ),
    with_change AS
    (
        SELECT
            *,
            round(
                ((toFloat64(demand) / nullIf(ytd_monthly_average, 0)) - 1) * 100,
                2
            ) AS increase_pct
        FROM with_ytd_average
        WHERE demand > 0
    ),
    ranked AS
    (
        SELECT
            *,
            row_number() OVER (
                PARTITION BY month
                ORDER BY increase_pct DESC, line_id ASC
            ) AS position
        FROM with_change
    )
SELECT
    month,
    line_id,
    demand,
    round(ytd_monthly_average) AS ytd_monthly_average,
    increase_pct,
    position
FROM ranked
WHERE position <= 10
SETTINGS log_comment = 'performance-demand-benchmark:top_mean_demand_by_line_by_month'
FORMAT Null;

-- 32. top_lines_30day_performance
-- Uses end_date as the report's as-of date. As in the legacy implementation,
-- averages count only dates on which a line has an observed demand row.
WITH
    YYYYMMDDToDate({end_date:UInt32}) AS as_of_date,
    toYYYYMMDD(as_of_date - INTERVAL 30 DAY) AS last_30_start,
    toYYYYMMDD(as_of_date - INTERVAL 1 YEAR) AS rolling_year_start,
    daily_by_line AS
    (
        SELECT
            operational_date,
            line_id,
            sum(accepted_validations_qty) AS demand
FROM performance.passenger_demand_by_dimensions_by_day
        WHERE
            definition_version = {definition_version:String}
            AND operational_date BETWEEN rolling_year_start AND {end_date:UInt32}
        GROUP BY operational_date, line_id
    ),
    line_statistics AS
    (
        SELECT
            line_id,
            sumIf(demand, operational_date >= last_30_start) AS last_30_days_total,
            countIf(operational_date >= last_30_start) AS last_30_days_observed_days,
            avgIf(toFloat64(demand), operational_date >= last_30_start) AS last_30_days_average,
            avg(toFloat64(demand)) AS rolling_year_average,
            sumIf(
                demand,
                operational_date >= last_30_start
                    AND toDayOfWeek(YYYYMMDDToDate(operational_date)) <= 5
            ) AS last_30_days_type_1,
            sumIf(
                demand,
                operational_date >= last_30_start
                    AND toDayOfWeek(YYYYMMDDToDate(operational_date)) = 6
            ) AS last_30_days_type_2,
            sumIf(
                demand,
                operational_date >= last_30_start
                    AND toDayOfWeek(YYYYMMDDToDate(operational_date)) = 7
            ) AS last_30_days_type_3
        FROM daily_by_line
        GROUP BY line_id
        HAVING
            last_30_days_observed_days >= 15
            AND rolling_year_average >= 10
    ),
    with_change AS
    (
        SELECT
            *,
            round(
                ((last_30_days_average / nullIf(rolling_year_average, 0)) - 1) * 100,
                2
            ) AS increase_pct
        FROM line_statistics
    ),
    ranked AS
    (
        SELECT
            *,
            row_number() OVER (ORDER BY increase_pct DESC, line_id ASC) AS top_position,
            row_number() OVER (ORDER BY increase_pct ASC, line_id ASC) AS worst_position
        FROM with_change
    )
SELECT *
FROM
(
    SELECT
        'top' AS performance_group,
        top_position AS position,
        line_id,
        increase_pct,
        last_30_days_total,
        last_30_days_type_1,
        last_30_days_type_2,
        last_30_days_type_3,
        round(rolling_year_average) AS rolling_year_average
    FROM ranked
    WHERE top_position <= 10

    UNION ALL

    SELECT
        'worst',
        worst_position,
        line_id,
        increase_pct,
        last_30_days_total,
        last_30_days_type_1,
        last_30_days_type_2,
        last_30_days_type_3,
        round(rolling_year_average)
    FROM ranked
    WHERE worst_position <= 10
)
SETTINGS log_comment = 'performance-demand-benchmark:top_lines_30day_performance'
FORMAT Null;

/* ------------------------------------------------------------------------- */
/* Benchmark report                                                          */
/* ------------------------------------------------------------------------- */

-- Query-log writes are asynchronous. FLUSH LOGS makes the completed queries
-- visible immediately. If this statement is forbidden for your user, wait for
-- the normal log flush and execute only the report query below.
SYSTEM FLUSH LOGS;

SELECT
    replaceOne(log_comment, 'performance-demand-benchmark:', '') AS metric,
    argMax(query_duration_ms, event_time_microseconds) AS duration_ms,
    argMax(read_rows, event_time_microseconds) AS read_rows,
    formatReadableSize(argMax(read_bytes, event_time_microseconds)) AS bytes_read,
    formatReadableSize(argMax(memory_usage, event_time_microseconds)) AS peak_memory,
    argMax(result_rows, event_time_microseconds) AS result_rows_before_format_null
FROM system.query_log
WHERE
    type = 'QueryFinish'
    AND event_time >= now() - INTERVAL 30 MINUTE
    AND startsWith(log_comment, 'performance-demand-benchmark:')
GROUP BY log_comment
ORDER BY duration_ms DESC;
