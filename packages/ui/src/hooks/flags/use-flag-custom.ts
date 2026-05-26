'use client';

import { useMemo } from 'react';

/* * */

interface UseFlagCustomReturnType {

	/**
	 * The flag result based on the
	 * provided conditions and operator.
	 */
	flag: boolean

}

/**
 * Hook to determine a custom flag based on provided conditions and a logical operator.
 * @param operator The logical operator to apply between conditions.
 * - `all` All conditions must be true for the flag to be true.
 * - `some` At least one condition must be true for the flag to be true.
 * @param conditions A list of boolean conditions to evaluate.
 * @returns An object containing the flag result.
 */
export function useFlagCustom(operator: 'all' | 'some', conditions: boolean[]): UseFlagCustomReturnType {
	//

	//
	// A. Handle actions

	const flagValue = useMemo(() => {
		// All conditions must be true
		if (operator === 'all') return conditions.every(condition => condition === true);
		// At least one condition must be true
		return conditions.some(condition => condition === true);
	}, [operator, conditions]);

	//
	// B. Return value

	return { flag: flagValue };

	//
};
