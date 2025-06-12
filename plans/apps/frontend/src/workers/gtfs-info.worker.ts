/* * */

import { GtfsAgency, GtfsFeedInfo } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
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

		console.log('Stop times size:', stopTimes?.size);

		if (!feedInfo || !agency || !stopTimes) {
			const filesNotFound: string[] = [];
			if (!feedInfo) filesNotFound.push('feed_info.txt');
			if (!agency) filesNotFound.push('agency.txt');
			console.log(filesNotFound);
			throw new Error(`${filesNotFound.join(', ')} not found in the GTFS zip file`);
		}

		const agencyData = papa.parse<GtfsAgency>(agency, {
			header: true,
			skipEmptyLines: true,
		});

		const feedInfoData = papa.parse<GtfsFeedInfo>(feedInfo, {
			header: true,
			skipEmptyLines: true,
			transform: (value, field) => {
				if (field === 'feed_start_date' || field === 'feed_end_date') {
					return Dates.fromOperationalDate(value, 'Europe/Lisbon').unix_timestamp;
				}
				return value;
			},
		});

		// Return the feed info data
		self.postMessage({ agency: agencyData.data[0], feedInfo: feedInfoData.data[0] });
	}
	catch (error) {
		console.error('Error parsing GTFS file:', error);
		self.postMessage({ error: error instanceof Error ? error : new Error('Unknown error') });
	}
});
