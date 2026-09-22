/* * */

/**
 * The analyses included in the output, and the columns each one contributes
 * besides its grade. The grade is always included.
 */
const ANALYSES: { extra: string[], name: string }[] = [
	{ extra: [], name: 'at_least_one_vehicle_event_on_first_stop' },
	{ extra: [], name: 'at_least_one_vehicle_event_on_last_stop' },
	{ extra: [], name: 'expected_apex_validation_interval' },
	{ extra: [], name: 'expected_driver_id_qty' },
	{ extra: ['observed_start_time_delta'], name: 'expected_start_time' },
	{ extra: [], name: 'expected_vehicle_event_delay' },
	{ extra: [], name: 'expected_vehicle_event_interval' },
	{ extra: ['expected_vehicle_events_qty', 'observed_vehicle_events_qty'], name: 'expected_vehicle_event_qty' },
	{ extra: [], name: 'expected_vehicle_id_qty' },
	{ extra: [], name: 'matching_apex_locations' },
	{ extra: [], name: 'matching_vehicle_ids' },
	{ extra: [], name: 'simple_one_apex_validation' },
	{ extra: [], name: 'simple_one_vehicle_event_or_apex_validation' },
	{ extra: ['reason', 'stop_ids_first', 'stop_ids_last', 'stop_ids_middle'], name: 'simple_three_vehicle_events' },
	{ extra: ['expected_transactions_qty', 'found_transactions_qty', 'missing_transactions_qty'], name: 'transaction_sequentiality' },
	{ extra: ['expected_transactions_qty', 'found_transactions_qty', 'missing_transactions_qty'], name: 'expected_vehicle_event_coverage_geo' },
];

/**
 * The ride columns carried through the query, in the order the output expects them.
 */
const RIDE_COLUMNS = [
	'_id',
	'agency_id',
	'apex_locations_qty',
	'apex_refunds_amount',
	'apex_refunds_qty',
	'apex_sales_amount',
	'apex_sales_qty',
	'apex_validations_qty',
	'driver_ids',
	'end_time_observed',
	'end_time_scheduled',
	'extension_observed',
	'extension_scheduled',
	'headsign',
	'operational_date',
	'passengers_estimated',
	'passengers_observed',
	'passengers_observed_prepaid_amount',
	'passengers_observed_prepaid_qty',
	'passengers_observed_sales_amount',
	'passengers_observed_sales_qty',
	'passengers_observed_subscription_qty',
	'plan_id',
	'route_id',
	'route_short_name',
	'seen_first_at',
	'seen_last_at',
	'shape_id',
	'start_time_observed',
	'start_time_scheduled',
	'timezone',
	'trip_id',
	'vehicle_ids',
];

/* * */

function indent(lines: string[], depth: number): string {
	return lines.map(line => `${'\t'.repeat(depth)}${line}`).join(',\n');
}

function analysisCte({ extra, name }: (typeof ANALYSES)[number]): string {
	const columns = ['grade_status', ...extra].map(column => `argMax(${column}, updated_at) AS ${column}`);

	return `
	analysis_${name} AS
	(
		SELECT
			ride_id,
${indent(columns, 3)}
		FROM operation.ride_analysis_${name}
		WHERE operational_date BETWEEN operational_date_from AND operational_date_to
		GROUP BY ride_id
	)`;
}

function analysisJoinedColumns({ extra, name }: (typeof ANALYSES)[number]): string {
	const columns = [
		`analysis_${name}.grade_status AS _analysis_${name}_grade`,
		...extra.map(column => `analysis_${name}.${column} AS analysis_${name}_${column}`),
	];

	return indent(columns, 3);
}

function analysisJoin(name: string): string {
	return `
		LEFT JOIN analysis_${name}
			ON analysis_${name}.ride_id = r._id`;
}

/*
 * The grade of an analysis that never ran, or that is not applicable yet,
 * must read as empty in the output. A missing LEFT JOIN row yields the default
 * of LowCardinality(String) instead of NULL, hence the nullIf().
 */
function analysisEffectiveGrade(name: string): string {
	return `
			CASE
				WHEN operational_status IN ('scheduled', 'running')
				THEN NULL
				ELSE nullIf(_analysis_${name}_grade, '')
			END AS analysis_${name}_grade`;
}

function analysisOutputColumns({ extra, name }: (typeof ANALYSES)[number]): string {
	const columns = [
		`analysis_${name}_grade`,
		...extra.map(column => `analysis_${name}_${column}`),
	];

	return indent(columns, 1);
}

/*
 * Rides and analyses use ReplacingMergeTree(updated_at), so the latest version
 * is selected explicitly instead of with FINAL: LIMIT 1 BY for the rides, and
 * argMax() for the analyses.
 *
 * The shape follows `modules/operation/sql/rides/list-rides.sql`, including the
 * padded operational date bounds that prune partitions and the derived statuses,
 * so that an extraction returns exactly what the list shows for the same filters.
 * Unlike the list, there is no row limit and no exact-ride branch, and the
 * projection is wide enough for the whole output row.
 *
 * Two injection points, filled by `apply-query.ts`:
 *
 *   --RIDE FILTERS HERE--     inside the read of operation.rides, before the latest
 *                             version is selected. Only attributes that are identical
 *                             across every version of a ride may go here, so the
 *                             primary key can prune the read.
 *   --DERIVED FILTERS HERE--  after deduplication and status derivation, for attributes
 *                             that change between versions (driver/vehicle ids) and for
 *                             every derived status or grade.
 */
export const operationRidesV3ExtractionQuery = `
WITH
	toUnixTimestamp64Milli(now64(3)) AS now_ms,

	toYYYYMMDD(fromUnixTimestamp64Milli(toInt64($1)) - INTERVAL 1 DAY) AS operational_date_from,
	toYYYYMMDD(fromUnixTimestamp64Milli(toInt64($2)) + INTERVAL 1 DAY) AS operational_date_to,

	rides_latest AS
	(
		SELECT
${indent(RIDE_COLUMNS, 3)}
		FROM operation.rides
		WHERE
			operational_date BETWEEN operational_date_from AND operational_date_to
			AND start_time_scheduled >= $1
			AND start_time_scheduled <= $2
			--RIDE FILTERS HERE--
		ORDER BY
			updated_at DESC
		LIMIT 1 BY _id
	),
${ANALYSES.map(analysisCte).join(',\n')},

	ride_with_analyses AS
	(
		SELECT
			r.*,

${ANALYSES.map(analysisJoinedColumns).join(',\n\n')}

		FROM rides_latest AS r
${ANALYSES.map(({ name }) => analysisJoin(name)).join('\n')}
	),

	ride_with_statuses AS
	(
		SELECT
			*,

			CASE
				WHEN
					seen_last_at IS NULL
					AND now_ms - start_time_scheduled <= 600000
				THEN 'scheduled'

				WHEN
					seen_last_at IS NULL
					AND now_ms - start_time_scheduled > 600000
				THEN 'missed'

				WHEN
					seen_last_at IS NOT NULL
					AND now_ms - seen_last_at <= 600000
				THEN 'running'

				ELSE 'ended'
			END AS operational_status,

			CASE
				WHEN seen_last_at IS NULL
				THEN 'unseen'

				WHEN now_ms - seen_last_at <= 30000
				THEN 'seen'

				ELSE 'gone'
			END AS seen_status,

			CASE
				WHEN start_time_observed IS NULL
				THEN NULL

				WHEN start_time_observed - start_time_scheduled > 300000
				THEN 'delayed'

				WHEN start_time_observed - start_time_scheduled < -60000
				THEN 'early'

				ELSE 'ontime'
			END AS start_delay_status,

			CASE
				WHEN end_time_observed IS NULL
				THEN NULL

				WHEN end_time_observed - end_time_scheduled > 300000
				THEN 'delayed'

				WHEN end_time_observed - end_time_scheduled < -60000
				THEN 'early'

				ELSE 'ontime'
			END AS end_delay_status

		FROM ride_with_analyses
	),

	ride_view AS
	(
		SELECT
			*,
${ANALYSES.map(({ name }) => analysisEffectiveGrade(name)).join(',\n')}

		FROM ride_with_statuses
	)

SELECT
${indent(RIDE_COLUMNS, 1)},

	operational_status,
	seen_status,
	start_delay_status,
	end_delay_status,

${ANALYSES.map(analysisOutputColumns).join(',\n')}

FROM ride_view

WHERE
	1 = 1
	--DERIVED FILTERS HERE--

ORDER BY
	start_time_scheduled ASC,
	_id ASC

/*
 * Per-part column statistics (ClickHouse 26.x) are loaded for every part of
 * every referenced table at plan time, which costs several seconds on
 * operation.rides regardless of the date range. The primary key and the
 * min-max index prune the same parts without them.
 */
SETTINGS use_statistics = 0
`;
