/* * */

/**
 * Derived supply metrics shared by agency / line / pattern / pattern_hour.
 * Per-pax ratios use 0 when there are no passengers (avoid division by zero).
 */
export const computeSupplyDerivedFields = (cost: number, revenue: number, passengersObserved: number) => {
	const safeCost = Number(cost) || 0;
	const safeRevenue = Number(revenue) || 0;
	const passengers = Number(passengersObserved) || 0;

	return {
		cost_per_pax: passengers > 0 ? safeCost / passengers : 0,
		net_result: safeRevenue - safeCost,
		revenue_per_pax: passengers > 0 ? safeRevenue / passengers : 0,
	};
};
