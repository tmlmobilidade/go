/* * */

import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';

/* * */

export type WorkerMessage = {
	agency: GtfsValidation['gtfs_agency']
	error: null
	feed_info: GtfsValidation['gtfs_feed_info']
} | {
	agency?: never
	error: { message: string }
	feed_info?: never
};
