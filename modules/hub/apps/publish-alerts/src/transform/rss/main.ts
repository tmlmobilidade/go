/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type RssRawItem } from '@tmlmobilidade/rss/dist/types/feed.types.js';
import { type Alert } from '@tmlmobilidade/types';

/**
 * Transforms an Alert object into an RSS Feed Entity object.
 * This function validates the required properties of the input Alert object,
 * maps the cause and effect values to RSS standard values, transforms the
 * header and description texts, URL and image into RSS objects, and prepares
 * the informed_entity value based on the reference_type of the alert.
 * The output of this function still needs to be wrapped in an RSS FeedMessage object with
 * the appropriate header and any other feed entities before it can be served in an RSS feed.
 * @param alertData The Alert object to be transformed.
 * @param feedBaseUrl The base URL for the RSS feed.
 * @returns An RSS Feed Entity object or undefined if the transformation fails.
 */
export async function transformAlertIntoRssEntity(alertData: Alert, feedBaseUrl: string): Promise<RssRawItem | undefined> {
	try {
		//

		return {
			description: alertData.description,
			link: `${feedBaseUrl}/${alertData._id}`,
			linkLabel: 'Ver o alerta completo em carrismetropolitana.pt',
			publish_start_date: alertData.publish_start_date,
			title: alertData.title,
		};

		//
	} catch (error) {
		Logger.error(`[Alert ID: ${alertData._id}] Error transforming alert: ${(error as Error).message}`);
	}
}
