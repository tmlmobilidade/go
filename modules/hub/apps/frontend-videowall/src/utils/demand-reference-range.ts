/* * */

import { type PassengerDemandValue } from '@tmlmobilidade/go-types-public-info';

/* * */

interface DemandReferenceDeviationRange {
	lower: number
	upper: number
}

/* * */

export function getDemandReferenceDeviationRange(
	value: null | PassengerDemandValue | undefined,
): DemandReferenceDeviationRange | null {
	const typicalCumulativeQty = value?.typical_cumulative_qty;
	const typicalRange = value?.typical_range;
	if (!typicalCumulativeQty || !typicalRange) return null;

	return {
		lower: typicalRange.lower / typicalCumulativeQty * 100 - 100,
		upper: typicalRange.upper / typicalCumulativeQty * 100 - 100,
	};
}

/* * */
