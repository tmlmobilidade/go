/* * */

const ANALYSES: { extra: string[], name: string }[] = [
	{ extra: ['vehicle_events_on_first_stop_qty'], name: 'at_least_one_vehicle_event_on_first_stop' },
	{ extra: ['vehicle_events_on_last_stop_qty'], name: 'at_least_one_vehicle_event_on_last_stop' },
	{ extra: ['observed_driver_ids_qty'], name: 'expected_driver_id_qty' },
	{ extra: ['observed_start_time', 'observed_start_time_delta'], name: 'expected_start_time' },
	{ extra: ['observed_average_delay', 'observed_max_delay', 'observed_min_delay', 'vehicle_events_qty', 'vehicle_events_with_delay_percent', 'vehicle_events_with_delay_qty'], name: 'expected_vehicle_event_delay' },
	{ extra: ['observed_average_interval', 'observed_max_interval', 'observed_min_interval'], name: 'expected_vehicle_event_interval' },
	{ extra: ['expected_vehicle_events_qty', 'observed_vehicle_events_qty'], name: 'expected_vehicle_event_qty' },
	{ extra: ['observed_vehicle_ids_qty'], name: 'expected_vehicle_id_qty' },
	{ extra: ['expected_apex_locations_qty', 'matching_apex_locations_qty', 'missing_apex_locations_qty'], name: 'matching_apex_locations' },
	{ extra: [], name: 'simple_one_apex_validation' },
	{ extra: [], name: 'simple_one_vehicle_event_or_apex_validation' },
	{ extra: ['stop_ids_first', 'stop_ids_middle', 'stop_ids_last'], name: 'simple_three_vehicle_events' },
	{ extra: ['expected_transactions_qty', 'found_transactions_qty', 'missing_transactions_qty'], name: 'transaction_sequentiality' },
];

function analysisCte(name: string) {
	return `
	analysis_${name} AS
	(
		SELECT
			*
		FROM operation.ride_analysis_${name}
		WHERE operational_date IN
		(
			SELECT DISTINCT operational_date
			FROM rides_latest
		)
		ORDER BY
			updated_at DESC
		LIMIT 1 BY ride_id
	)`;
}

function analysisColumns({ extra, name }: (typeof ANALYSES)[number]) {
	const prefix = `analysis_${name}`;
	const columns = [
		`${prefix}.grade_status AS ${prefix}_grade_status`,
		`${prefix}.reason AS ${prefix}_reason`,
		...extra.map(column => `${prefix}.${column} AS ${prefix}_${column}`),
	];

	return columns.map(column => `\t${column}`).join(',\n');
}

function analysisJoin(name: string) {
	return `
LEFT JOIN analysis_${name}
	ON analysis_${name}.ride_id = r._id`;
}

/*
 * Rides and analyses use ReplacingMergeTree(updated_at).
 * Select the latest physical version with ORDER BY updated_at DESC / LIMIT 1 BY
 * instead of FINAL. Analysis tables are pruned by operational_date first.
 */
export const operationRidesV1ExtractionQuery = `
WITH
	rides_latest AS
	(
		SELECT
			*
		FROM operation.rides
		WHERE
			start_time_scheduled >= {start_time_scheduled_start:Int64}
			AND start_time_scheduled <= {start_time_scheduled_end:Int64}
			AND has({agency_ids:Array(String)}, agency_id)
		ORDER BY
			updated_at DESC
		LIMIT 1 BY _id
	),
${ANALYSES.map(({ name }) => analysisCte(name)).join(',\n')}

SELECT
	r.*,
	r.operational_date AS operational_date,
	r.agency_id AS agency_id,

${ANALYSES.map(analysis => analysisColumns(analysis)).join(',\n\n')}

FROM rides_latest AS r
${ANALYSES.map(({ name }) => analysisJoin(name)).join('\n')}

ORDER BY
	r.start_time_scheduled ASC,
	r._id ASC
`;
