/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { createRssFeed, type RssRawItem } from '@tmlmobilidade/rss';

import { transformAlertIntoRssEntity } from '../transform/rss/main.js';

/* * */

export async function publishRssFeed(organization: Organization, agencyIds: string[]) {
	//

	Logger.title('Starting build of RSS feed...');

	const globalTimer = new Timer();
	const feedUrl = `${getModuleConfig('hub', 'api_url')}/v1/${encodeURIComponent(organization._id)}/alerts`;

	//
	// Retrieve active alerts from the database

	const findResult = await goDb.operation.alerts.findMany(
		{
			$and: [
				{
					$or: [
						{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_milliseconds } },
						{ publish_end_date: null },
						{ publish_end_date: undefined },
						{ publish_end_date: { $exists: false } },
					],
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_milliseconds },
					publish_status: 'published',
				},
			],
			agency_id: { $in: agencyIds },
		},
		{
			sort: { created_at: -1 },
		},
	);

	Logger.info({ message: `Retrieved ${findResult.length} active alerts...` });

	//
	// Transform alerts into RSS feed entities

	const transformedItems = await Promise.all(findResult.map(alert => transformAlertIntoRssEntity(alert, feedUrl)));

	const transformResult: RssRawItem[] = transformedItems.filter((item): item is RssRawItem => item !== undefined);

	Logger.info({ message: `Transformed ${transformResult.length} alerts into RSS feed entities (${globalTimer.get()})` });

	//
	// Save the result in API Cache

	const rssFeed: string = createRssFeed(transformResult, {
		copyright: organization.long_name,
		description: `Alertas e atualizações de ${organization.long_name}.`,
		feedSelfUrl: `${feedUrl}.rss`,
		link: feedUrl,
		title: `${organization.long_name} - Alertas`,
	});

	await cacheDb.set(getOrganizationCacheKey(organization._id, 'alerts:published:rss'), rssFeed);

	Logger.success(`Finished publishing RSS feed (${globalTimer.get()})`);

	//
};
