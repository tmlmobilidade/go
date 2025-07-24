/* * */

import { type GtfsAgency, type GtfsFeedInfo } from '@tmlmobilidade/types';

/* * */

export interface WorkerMessage {
	agency: GtfsAgency
	error: Error | null
	feedInfo: GtfsFeedInfo
}
