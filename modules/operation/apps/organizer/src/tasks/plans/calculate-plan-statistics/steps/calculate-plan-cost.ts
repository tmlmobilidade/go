/* * */

export type PlanCost =
  | { amount: null, status: 'invalid_configuration' | 'missing_configuration' }
  | { amount: number, status: 'ready' };

/* * */

/** Estimates the cost in EUR using total vehicle kilometers and the agency's EUR/km rate. */
export function calculatePlanCost(totalVkms: number, pricePerKm: unknown): PlanCost {
	if (!Number.isFinite(totalVkms) || totalVkms < 0) {
		throw new Error('Cannot calculate plan cost: total VKM must be finite and nonnegative.');
	}

	if (pricePerKm == null || (typeof pricePerKm === 'string' && !pricePerKm.trim())) {
		return { amount: null, status: 'missing_configuration' };
	}

	if (typeof pricePerKm !== 'number' && typeof pricePerKm !== 'string') {
		return { amount: null, status: 'invalid_configuration' };
	}

	const rate = Number(pricePerKm);
	const amount = totalVkms * rate;

	if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(amount)) {
		return { amount: null, status: 'invalid_configuration' };
	}

	return { amount, status: 'ready' };
}
