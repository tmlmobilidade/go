/* * */

import { files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type RssRawImageInput, type RssRawItem } from '@tmlmobilidade/rss/dist/types/feed.types.js';
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

		const images: RssRawImageInput[] = [];
		const fileIdOrder: string[] = [];
		const seen = new Set<string>();

		const attachedFiles = await files.findMany(
			{ resource_id: alertData._id, scope: 'alerts' },
			{ sort: { created_at: 1 } },
		);

		if (alertData.file_id) {
			fileIdOrder.push(alertData.file_id);
			seen.add(alertData.file_id);
		}

		for (const f of attachedFiles) {
			if (!seen.has(f._id)) {
				fileIdOrder.push(f._id);
				seen.add(f._id);
			}
		}

		for (const fileId of fileIdOrder) {
			try {
				const file = await files.findById(fileId);
				if (!file?.url) continue;
				images.push({
					alt: alertData.title,
					type: file.type ?? null,
					url: file.url,
				});
			} catch {
				// DB row exists but object missing in storage — omit image, still emit the item
			}
		}

		return {
			description: alertData.description,
			images: images.length ? images : [],
			link: `${feedBaseUrl}/${alertData._id}`,
			linkLabel: 'Ver o alerta completo em carrismetropolitana.pt',
			publish_start_date: alertData.publish_start_date,
			title: alertData.title,
		};

		//
	} catch (error) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Error transforming alert: ${(error as Error).message}` });
	}
}
