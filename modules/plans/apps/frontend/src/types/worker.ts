/* * */

import { type Plan } from '@tmlmobilidade/go-types';

/* * */

export interface WorkerMessage {
	agency: Plan['gtfs_agency']
	error: Error | null
	feed_info: Plan['gtfs_feed_info']
}
