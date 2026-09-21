/* * */

import { type GtfsStrictV30FeedInfo, GtfsStrictV30FeedInfoSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/logger';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { type NormalizePlansTaskContext } from '../context/init-context.js';

/**
 * Builds the contents of the feed_info.txt file from the given Plan and Agency documents.
 */
export function updateFeedInfoTxtContents(context: NormalizePlansTaskContext) {
	//

	//
	// Build and validate the feed info row.

	const feedInfoRow: GtfsStrictV30FeedInfo = {
		default_lang: context.data.agency.primary_language,
		feed_contact_email: 'go@tmlmobilidade.pt',
		feed_contact_url: 'https://go.tmlmobilidade.pt',
		feed_end_date: context.data.plan.active_until,
		feed_lang: context.data.agency.primary_language,
		feed_publisher_name: 'Transportes Metropolitanos de Lisboa',
		feed_publisher_url: 'https://go.tmlmobilidade.pt',
		feed_start_date: context.data.plan.active_from,
		feed_version: context.data.plan._id,
	};

	const validatedFeedInfoRow = GtfsStrictV30FeedInfoSchema.parse(feedInfoRow);

	const newFeedInfoTxtString = csvStringify([validatedFeedInfoRow], { header: true });

	//
	// Write the new feed_info.txt file to the extracted directory

	fs.writeFileSync(path.join(context.paths.extracted_dir_path, 'feed_info.txt'), newFeedInfoTxtString);

	Logger.info({ message: `[${context.data.plan._id}] feed_info.txt file updated.` });
}
