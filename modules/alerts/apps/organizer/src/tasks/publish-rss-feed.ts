/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { alerts, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { RssRawImageInput } from '@tmlmobilidade/rss';
import { Timer } from '@tmlmobilidade/timer';
import { type Alert } from '@tmlmobilidade/types';

/* * */

const RSS_FEED_URL = 'https://www.carrismetropolitana.pt/alerts.rss';

/* * */

export async function buildRssFeed() {
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
	// Transform alerts into GTFS-RT feed entities

	const xmlItems = await Promise.all(findResult.map(async (alert) => {
		const images: RssRawImageInput[] = [];
		const fileIdOrder: string[] = [];
		const seen = new Set<string>();

		const attachedFiles = await files.findMany(
			{ resource_id: alert._id, scope: 'alerts' },
			{ sort: { created_at: 1 } },
		);

		if (alert.file_id) {
			fileIdOrder.push(alert.file_id);
			seen.add(alert.file_id);
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
					alt: alert.title,
					type: file.type ?? null,
					url: file.url,
				});
			} catch {
				// DB row exists but object missing in storage — omit image, still emit the item
			}
		}

		return {
			description: alert.description,
			images: images.length ? images : [],
			link: `${alertsPublicListUrl}/${alert._id}`,
			linkLabel: 'Ver o alerta completo em carrismetropolitana.pt',
			publish_start_date: alert.publish_start_date,
			title: alert.title,
		};
	}));

	const xml = createRssFeed(xmlItems, {
		copyright: 'Carris Metropolitana',
		description: 'Alertas e atualizacoes da Carris Metropolitana.',
		feedSelfUrl: `${alertsPublicListUrl}.rss`,
		link: alertsPublicListUrl,
		title: 'Carris Metropolitana - Alertas',
	});

	reply.type('application/rss+xml; charset=utf-8').send(xml);

	Logger.info(`Transformed ${xmlItems.length} alerts into RSS feed entities (${globalTimer.get()})`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:alerts:published:gtfs', JSON.stringify(result));

	Logger.success(`Finished organizing alert structure (${globalTimer.get()})`);

	//
};
