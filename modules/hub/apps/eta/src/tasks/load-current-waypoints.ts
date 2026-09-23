/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

/**
 * Loads the stop waypoints of current rides and snaps them to shape nodes.
 *
 * Only trips not yet present are loaded: the stops of a hashed trip never
 * change, so once a trip is in `eta.curr_waypoints` it is never sent again.
 */
export async function loadCurrentWaypoints(): Promise<void> {
	await labDb.queryFromFile(sqlPath('hub', 'eta/loader/load-current-waypoints.sql'));
	Logger.progress({ message: 'Loaded current waypoints: curr_waypoints' });

	await labDb.queryFromFile(sqlPath('hub', 'eta/loader/snap-waypoints.sql'));
	Logger.progress({ message: 'Snapped waypoints: curr_waypoints_snapped' });
}
