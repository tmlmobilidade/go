import { Dates } from '@tmlmobilidade/go-utils-dates';
import { randomUUID } from 'node:crypto';

import { executeSql, querySql } from '../../storage.js';

/** Preserve the existing Hub output without editing its reader or exposing half-rebuilt months. */
export async function runDemandByAgencyByOperationalDate(timespan: 'full' | 'realtime' | 'weekly') {
	const now = Dates.now('Europe/Lisbon');
	const previous = now.minus({ days: 7 });
	const month = String(now.operational_date_int).slice(0, 6);
	const previousMonth = String(previous.operational_date_int).slice(0, 6);
	const startMonth = previousMonth < month ? previousMonth : month;
	const params = {
		end_date: Number(`${month}31`),
		exclude_months: timespan === 'full' ? [month, previousMonth] : [],
		stage: `hub_demand_${randomUUID().replaceAll('-', '')}`,
		start_date: timespan === 'full' ? 20010101 : Number(`${startMonth}01`),
	};
	// Daily owns older months; realtime owns the comparison months, so they cannot race.
	await executeSql('demand/create-stage.sql', params);
	try {
		await executeSql('demand/by-agency-by-operational-date.sql', params);
		const partitions = await querySql<{ has_replacement: boolean, partition: string }>('demand/partitions.sql', params);
		for (const partition of partitions) {
			await executeSql(`demand/${partition.has_replacement ? 'replace-partition' : 'clear-partition'}.sql`, {
				...params,
				partition: Number(partition.partition),
			});
		}
	} finally {
		await executeSql('demand/drop-stage.sql', params);
	}
}
