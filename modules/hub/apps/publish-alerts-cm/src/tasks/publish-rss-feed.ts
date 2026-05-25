/* * */

import { transformAlertIntoRssEntity } from '@/transform/rss/main.js';
import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { createRssFeed, type RssRawItem } from '@tmlmobilidade/rss';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const RSS_FEED_URL = 'https://www.carrismetropolitana.pt/alerts';

/* * */

export async function publishRssFeed() {
	//

	Logger.title('Starting build of RSS feed...');

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const findResult = await alerts.findMany(
		{
			$and: [
				{
					$or: [
						{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_timestamp } },
						{ publish_end_date: null },
						{ publish_end_date: undefined },
						{ publish_end_date: { $exists: false } },
					],
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_timestamp },
					publish_status: 'published',
				},
			],
		},
		{
			sort: { created_at: -1 },
		},
	);

	Logger.info(`Retrieved ${findResult.length} active alerts...`);

	//
	// Transform alerts into RSS feed entities

	const transformedItems = await Promise.all(findResult.map(alert => transformAlertIntoRssEntity(alert, RSS_FEED_URL)));

	const transformResult: RssRawItem[] = transformedItems.filter(Boolean);

	Logger.info(`Transformed ${transformResult.length} alerts into RSS feed entities (${globalTimer.get()})`);

	//
	// Save the result in API Cache

	const rssFeed: string = createRssFeed(transformResult, {
		copyright: 'Carris Metropolitana',
		description: 'Alertas e atualizações da Carris Metropolitana.',
		feedSelfUrl: `${RSS_FEED_URL}.rss`,
		link: RSS_FEED_URL,
		title: 'Carris Metropolitana - Alertas',
	});

	await apiCache.set('hub:alerts:published:rss:cm', rssFeed);

	Logger.success(`Finished publishing RSS feed (${globalTimer.get()})`);

	//
};
