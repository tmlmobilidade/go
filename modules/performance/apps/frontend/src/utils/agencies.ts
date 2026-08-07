/* * */

import { AGENCY_ID_EQUIVALENTS } from '@/constants';

/* * */

export function getEquivalentAgencyIds(agencyId: string): readonly string[] {
	if (agencyId in AGENCY_ID_EQUIVALENTS) {
		return AGENCY_ID_EQUIVALENTS[agencyId as keyof typeof AGENCY_ID_EQUIVALENTS];
	}

	return [agencyId];
}

export function getMetricAgencyData<T>(agencies: Record<string, T>, agencyId: string): T | undefined {
	for (const equivalentAgencyId of getEquivalentAgencyIds(agencyId)) {
		if (equivalentAgencyId in agencies) return agencies[equivalentAgencyId];
	}

	return undefined;
}
