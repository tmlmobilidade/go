/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const VIEW = 'eta.mv_pred_node_etas';

/* * */

/**
 * Triggers a refresh of the node prediction view.
 *
 * The view refreshes every 15 minutes on its own; triggering it right after
 * aggregation lets fresh aggregates reach `eta.pred_node_etas` (and, 30 s
 * later, the stop ETAs) without waiting for the next scheduled refresh. Stop
 * ETAs read as 0 while `pred_node_etas` is empty, so on a first run this
 * matters. A refused statement is logged and left to the schedule.
 */
export async function refreshNodePredictions(): Promise<void> {
	try {
		await labDb.command({ query: `SYSTEM REFRESH VIEW ${VIEW}` });
		Logger.progress({ message: `Triggered refresh of ${VIEW}` });
	} catch (error) {
		Logger.error({ error, message: `Could not trigger ${VIEW} refresh; it will run on its 15-minute schedule` });
	}
}
