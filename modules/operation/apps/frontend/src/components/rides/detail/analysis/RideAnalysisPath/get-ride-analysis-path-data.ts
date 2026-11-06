import { type SimplifiedApexBankingTap, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type HashedTrip } from '@tmlmobilidade/go-types-operation';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

/* * */

export interface RideAnalysisPathRow {
	passengers_observed: number
	passengers_observed_banking_taps_qty: number
	passengers_observed_prepaid_amount: number
	passengers_observed_prepaid_qty: number
	passengers_observed_sales_amount: number
	passengers_observed_sales_qty: number
	passengers_observed_subscription_qty: number
	row_id: string
	seen_first_at: null | UnixMilliseconds
	seen_last_at: null | UnixMilliseconds
	stop_id: null | string
	stop_name: null | string
	stop_sequences: number[]
}

interface RideAnalysisPathData {
	bankingTaps: readonly Pick<SimplifiedApexBankingTap, 'created_at' | 'group_dimension' | 'stop_id'>[]
	hashedTrip: readonly Pick<HashedTrip, 'stop_id' | 'stop_name' | 'stop_sequence'>[]
	refunds: readonly Pick<SimplifiedApexOnBoardRefund, 'created_at' | 'stop_id'>[]
	sales: readonly Pick<SimplifiedApexOnBoardSale, 'created_at' | 'is_passenger' | 'price' | 'product_quantity' | 'stop_id'>[]
	validations: readonly Pick<SimplifiedApexValidation, 'category' | 'created_at' | 'is_passenger' | 'stop_id' | 'units_qty'>[]
}

/** Aggregate by stop ID, since APEX transactions do not identify a route stop occurrence. */
export function getRideAnalysisPathData({ bankingTaps, hashedTrip, refunds, sales, validations }: RideAnalysisPathData): RideAnalysisPathRow[] {
	const rowsByStopId = new Map<null | string, RideAnalysisPathRow>();

	function getStopRow(stopId: null | string) {
		let row = rowsByStopId.get(stopId);
		if (!row) {
			row = {
				passengers_observed: 0,
				passengers_observed_banking_taps_qty: 0,
				passengers_observed_prepaid_amount: 0,
				passengers_observed_prepaid_qty: 0,
				passengers_observed_sales_amount: 0,
				passengers_observed_sales_qty: 0,
				passengers_observed_subscription_qty: 0,
				row_id: JSON.stringify(stopId),
				seen_first_at: null,
				seen_last_at: null,
				stop_id: stopId,
				stop_name: null,
				stop_sequences: [],
			};
			rowsByStopId.set(stopId, row);
		}
		return row;
	}

	function recordTimestamp(row: RideAnalysisPathRow, timestamp: UnixMilliseconds) {
		if (row.seen_first_at === null || timestamp < row.seen_first_at) row.seen_first_at = timestamp;
		if (row.seen_last_at === null || timestamp > row.seen_last_at) row.seen_last_at = timestamp;
	}

	for (const stop of [...hashedTrip].sort((a, b) => a.stop_sequence - b.stop_sequence)) {
		const row = getStopRow(stop.stop_id);
		row.stop_name = stop.stop_name;
		row.stop_sequences.push(stop.stop_sequence);
	}

	for (const validation of validations) {
		if (!validation.is_passenger) continue;
		const row = getStopRow(validation.stop_id || null);
		row.passengers_observed++;
		if (validation.category === 'subscription') row.passengers_observed_subscription_qty++;
		if (validation.category === 'on_board_sale') row.passengers_observed_sales_qty++;
		if (validation.category === 'prepaid') {
			row.passengers_observed_prepaid_qty++;
			row.passengers_observed_prepaid_amount += validation.units_qty ?? 0;
		}
		recordTimestamp(row, validation.created_at);
	}

	for (const bankingTap of bankingTaps) {
		const row = getStopRow(bankingTap.stop_id || null);
		const passengers = bankingTap.group_dimension ?? 1;
		row.passengers_observed += passengers;
		row.passengers_observed_banking_taps_qty += passengers;
		recordTimestamp(row, bankingTap.created_at);
	}

	for (const sale of sales) {
		const row = getStopRow(sale.stop_id || null);
		if (sale.is_passenger) row.passengers_observed_sales_amount += sale.price * sale.product_quantity;
		recordTimestamp(row, sale.created_at);
	}

	for (const refund of refunds) {
		const row = getStopRow(refund.stop_id || null);
		recordTimestamp(row, refund.created_at);
	}

	return [...rowsByStopId.values()];
}
