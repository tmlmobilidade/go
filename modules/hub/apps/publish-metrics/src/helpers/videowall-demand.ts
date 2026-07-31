/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandRealtime } from '@tmlmobilidade/go-types-performance';
import { type VideowallDemandValue } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export interface VideowallDemandResult {
	agencies: Record<string, VideowallDemandValue>
	current_cutoff: number
	current_operational_date: number
	definition_version: 'passenger-demand-v2'
	generated_at: number
	last_week_cutoff: number
	last_week_operational_date: number
}

/* * */

export async function calculateVideowallDemand(referenceNow: Dates): Promise<VideowallDemandResult> {
	//

	Logger.title('Calculating Videowall Demand...');
	const timer = new Timer();
	const rows = await labDb.performance.passengerDemandRealtime
		.queryFromString<PassengerDemandRealtime>(
			`
				SELECT *
				FROM performance.passenger_demand_realtime FINAL
				WHERE
					definition_version = $1
					AND current_operational_date = $2
				ORDER BY agency_id
			`,
			{
				1: 'passenger-demand-v2',
				2: referenceNow.operational_date_int,
			},
		);

	if (rows.length === 0) {
		throw new Error('Passenger demand realtime projection is unavailable');
	}

	const reference = rows.reduce((latest, row) =>
		row.calculated_at > latest.calculated_at ? row : latest,
	);

	const agencies = Object.fromEntries(rows.map((row) => {
		const lastWeekQty = Number(row.passenger_validations_qty_last_week);
		const nowQty = Number(row.passenger_validations_qty_now);

		return [
			row.agency_id,
			{
				comparison_index_pct: lastWeekQty === 0 ? null : nowQty / lastWeekQty * 100,
				passenger_validations_qty_last_week: lastWeekQty,
				passenger_validations_qty_now: nowQty,
			},
		];
	}));

	Logger.success(`Finished calculating Videowall Demand (${timer.get()})`);

	return {
		agencies,
		current_cutoff: reference.current_cutoff,
		current_operational_date: reference.current_operational_date,
		definition_version: 'passenger-demand-v2',
		generated_at: reference.calculated_at,
		last_week_cutoff: reference.last_week_cutoff,
		last_week_operational_date: reference.last_week_operational_date,
	};

	//
}
