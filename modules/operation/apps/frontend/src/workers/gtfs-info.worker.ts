/* * */

import { type GtfsAgency, type GtfsFeedInfo } from '@tmlmobilidade/go-types-gtfs';
import jszip from 'jszip';
import papa from 'papaparse';

/* * */

self.addEventListener('message', async (event) => {
	try {
		const { file } = event.data;

		const zip = await jszip.loadAsync(file);
		const feedInfo = await zip.file('feed_info.txt')?.async('string');
		const agency = await zip.file('agency.txt')?.async('string');
		const stopTimes = await zip.file('stop_times.txt')?.async('blob');

		if (!feedInfo || !agency || !stopTimes) {
			const filesNotFound: string[] = [];
			if (!feedInfo) filesNotFound.push('feed_info.txt');
			if (!agency) filesNotFound.push('agency.txt');
			console.log(filesNotFound);
			throw new Error(`${filesNotFound.join(', ')} not found in the GTFS zip file`);
		}

		const emptyToUndefined = <T extends Record<string, unknown>>(obj: T) =>
			Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? undefined : v])) as T;

		const agencyData = papa.parse<GtfsAgency>(agency, {
			header: true,
			skipEmptyLines: true,
		});

		const feedInfoData = papa.parse<GtfsFeedInfo>(feedInfo, {
			header: true,
			skipEmptyLines: true,
		});

		// Return the feed info data
		self.postMessage({
			agency: emptyToUndefined(agencyData.data[0]),
			feed_info: emptyToUndefined(feedInfoData.data[0]),
		});
	} catch (error) {
		console.error('Error parsing GTFS file:', error);
		self.postMessage({ error: error instanceof Error ? error : new Error('Unknown error') });
	}
});
