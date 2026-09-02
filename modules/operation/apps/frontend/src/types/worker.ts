/* * */

import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';

/* * */

export interface WorkerMessage {
	agency: GtfsValidation['gtfs_agency']
	error: Error | null
	feed_info: GtfsValidation['gtfs_feed_info']
}
