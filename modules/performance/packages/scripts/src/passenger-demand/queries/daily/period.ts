/* * */

export const DEMAND_PERIOD_EXPRESSIONS = {
	day: 'operational_date',
	month: 'intDiv(operational_date, 100)',
	year: 'intDiv(operational_date, 10000)',
} as const;

export type DemandTimeGrain = keyof typeof DEMAND_PERIOD_EXPRESSIONS;

/**
 * Format a ClickHouse demand period for the public metric contract.
 */
export function formatDemandPeriod(period: number | string, timeGrain: DemandTimeGrain) {
	const value = String(period);

	if (timeGrain === 'year') return value.padStart(4, '0');
	if (timeGrain === 'month') {
		const padded = value.padStart(6, '0');
		return `${padded.slice(0, 4)}-${padded.slice(4, 6)}`;
	}

	const padded = value.padStart(8, '0');
	return `${padded.slice(0, 4)}-${padded.slice(4, 6)}-${padded.slice(6, 8)}`;
}

