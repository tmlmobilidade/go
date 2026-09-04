/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';
import { type GtfsStrictV30FeedInfo, GtfsStrictV30FeedInfoSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { stringify as csvStringify } from 'csv-stringify/sync';

/**
 * Builds the contents of the feed_info.txt file from the given Plan and Agency documents.
 */
export function getFeedInfoTxtContents(planData: Plan, agencyData: Agency): string {
	//

	//
	// Build and validate the feed info row.

	const feedInfoRow: GtfsStrictV30FeedInfo = {
		default_lang: agencyData.primary_language,
		feed_contact_email: 'go@tmlmobilidade.pt',
		feed_contact_url: 'https://go.tmlmobilidade.pt',
		feed_end_date: planData.active_until,
		feed_lang: agencyData.primary_language,
		feed_publisher_name: 'Transportes Metropolitanos de Lisboa',
		feed_publisher_url: 'https://go.tmlmobilidade.pt',
		feed_start_date: planData.active_from,
		feed_version: planData._id,
	};

	const validatedFeedInfoRow = GtfsStrictV30FeedInfoSchema.parse(feedInfoRow);

	return csvStringify([validatedFeedInfoRow], { header: true });

	//
}
