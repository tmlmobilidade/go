/* * */

import { Stop } from '@tmlmobilidade/types';

/**
 * Returns the agency-specific stop_id from stop.flags,
 * or fallback to stop._id as string.
 */
export function getAgencyStopId(stopData: Stop, agencyId: string): string {
	const foundFlag = stopData.flags?.find(item => Array.isArray(item.agency_ids) && item.agency_ids.includes(agencyId));
	return foundFlag?.stop_id || String(stopData._id);
}
