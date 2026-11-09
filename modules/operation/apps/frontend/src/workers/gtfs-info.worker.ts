/* * */

import { GtfsAgencySchema, GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { createValidationErrorMap, formatValidationError } from '@tmlmobilidade/go-utils-validation';
import jszip from 'jszip';
import papa from 'papaparse';

/* * */

self.addEventListener('message', async (event) => {
	try {
		const { file, locale = 'pt' } = event.data;
		const zip = await jszip.loadAsync(file);
		const agencyFile = zip.file('agency.txt');
		const feedInfoFile = zip.file('feed_info.txt');
		const stopTimesFile = zip.file('stop_times.txt');
		if (!agencyFile || !feedInfoFile || !stopTimesFile) {
			const filesNotFound = ['agency.txt', 'feed_info.txt', 'stop_times.txt'].filter(filename => !zip.file(filename));
			throw new Error(`${filesNotFound.join(', ')} not found in the GTFS zip file`);
		}

		const parseCsv = (filename: string, csv: string) => {
			const result = papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: 'greedy' });
			if (result.errors.length) throw new Error(`${filename}: ${result.errors.map(error => error.message).join('; ')}`);
			return Object.fromEntries(Object.entries(result.data[0] ?? {}).map(([key, value]) => [key, value === '' ? undefined : value]));
		};

		const agencyRow = parseCsv('agency.txt', await agencyFile.async('string'));
		const feedInfoRow = parseCsv('feed_info.txt', await feedInfoFile.async('string'));
		const error = createValidationErrorMap(locale);
		const agency = GtfsAgencySchema.safeParse(agencyRow, { error });
		const feedInfo = GtfsFeedInfoSchema.safeParse(feedInfoRow, { error });
		const errors = [
			...(!agency.success ? [`agency.txt: ${formatValidationError(agency.error, locale)}`] : []),
			...(!feedInfo.success ? [`feed_info.txt: ${formatValidationError(feedInfo.error, locale)}`] : []),
		];
		if (errors.length) throw new Error(errors.join('\n'));
		if (!agency.success || !feedInfo.success) return;

		self.postMessage({ agency: agency.data, error: null, feed_info: feedInfo.data });
	} catch (error) {
		// Plain objects retain the message reliably across the worker boundary.
		self.postMessage({ error: { message: error instanceof Error ? error.message : 'Unknown error' } });
	}
});
