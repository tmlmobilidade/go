/* * */

/** Estimates the cost in EUR using total vehicle kilometers and the agency's EUR/km rate. */
export function calculatePlanCost(totalVkms: number, pricePerKm: number): number {
	return totalVkms * pricePerKm;
}
