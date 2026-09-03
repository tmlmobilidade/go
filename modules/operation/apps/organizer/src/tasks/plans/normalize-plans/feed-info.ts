/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';
import { type GtfsStrictV30FeedInfo } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import Papa from 'papaparse';

/**
 * Builds the contents of the feed_info.txt file from the given Plan and Agency documents.
 */
export function buildFeedInfoTxt(planData: Plan, agencyData: Agency): string {
	//

	const contacts = agencyData.open_data?.contacts;

	if (!contacts) throw new Error(`Agency "${agencyData._id}" has no open_data.contacts.`);

	const feedInfoRow: GtfsStrictV30FeedInfo = {
		default_lang: agencyData.primary_language,
		feed_contact_email: contacts.email,
		feed_contact_url: contacts.website_url,
		feed_end_date: planData.active_until,
		feed_lang: agencyData.primary_language,
		feed_publisher_name: agencyData.name,
		feed_publisher_url: contacts.website_url,
		feed_start_date: planData.active_from,
		feed_version: planData._id,
	};

	return Papa.unparse([feedInfoRow]);

	//
}
