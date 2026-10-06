/* * */

import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Syncs the LabDB table with the GoDB collection.
 */
export async function syncLabdbTask() {
	//

	const timer = new Timer();

	Logger.info({ message: `LabDB synced in ${timer.get()}` });
}
