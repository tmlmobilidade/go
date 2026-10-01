/* * */

import { LOCATION_PERMISSION_SLOTS } from '@tmlmobilidade/go-types-locations';

/**
 * Mongo `$match` fragment: stop is allowed if any primary/secondary/tertiary
 * osm_id is in the user's `location_ids` permission values.
 */
export function locationPermissionMatch(allowedOsmIds: string[]) {
	const ids = allowedOsmIds.map(Number);
	return {
		$or: LOCATION_PERMISSION_SLOTS.map(slot => ({
			[`location.${slot}.osm_id`]: { $in: ids },
		})),
	};
}
