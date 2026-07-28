/* * */

import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';

/* * */

export const CM_AGENCIES = [
	AGENCY_ROUTE_CONFIG[41],
	AGENCY_ROUTE_CONFIG[42],
	AGENCY_ROUTE_CONFIG[43],
	AGENCY_ROUTE_CONFIG[44],
] as const;

export const CM_AGENCY_IDS = CM_AGENCIES.map(agency => agency.agency_id);

export type CmAgencyId = typeof CM_AGENCIES[number]['agency_id'];
