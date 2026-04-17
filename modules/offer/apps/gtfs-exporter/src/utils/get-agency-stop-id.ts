import { Stop } from '@tmlmobilidade/types';

/**
 * Returns the agency-specific stop_id from stop.flags, or fallback to stop._id as string
 */
export function getAgencyStopId(stopData: Stop, agencyId: string): string {
	const flag = stopData.flags?.find(f => Array.isArray(f.agency_ids) && f.agency_ids.includes(agencyId));
	return flag?.stop_id || String(stopData._id);
}
