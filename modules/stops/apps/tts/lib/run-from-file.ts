/* * */

import { makeStop } from '@/makeText.js';
import TIMETRACKER from '@helperkits/timer';
import { Logger } from '@tmlmobilidade/logger';
import { HubStop } from '@tmlmobilidade/types';
import fs from 'fs';
import Papa from 'papaparse';

/* CREATE TTS STOP NAME IN CSV */

interface HubStopExtended extends HubStop {
	airport: string
	bike_parking: string
	bike_sharing: string
	boat: string
	car_parking: string
	light_rail: string
	subway: string
	train: string
	tts_stop_name: string
}

(async () => {
	//

	Logger.title(`TTS TEXT`);
	const globalTimer = new TIMETRACKER();

	// Import stops.txt file
	console.log('* Reading stops.txt file from disk...');
	const allStopsTxt = fs.readFileSync('stops.txt', { encoding: 'utf8' });
	const allStopsPapa = Papa.parse<HubStopExtended>(allStopsTxt, { header: true });
	const allStopsData = allStopsPapa.data;

	// Define variable to hold results
	const ttsSummary = [];
	const stopsUpdated = [];
	const stopsDiff = [];

	// Log progress
	console.log('* Preparing ' + allStopsData.length + ' stops...');

	// Iterate on each stop
	for (const [index, stop] of allStopsData.entries()) {
		//
		process.stdout.clearLine(0);
		process.stdout.write(`* Processing stop ${stop._id} (${index}/${allStopsData.length})`);
		process.stdout.cursorTo(0);

		const modes = {
			airport: stop.flags.some(flag => flag.short_name === 'airport'),
			bike_sharing: stop.flags.some(flag => flag.short_name === 'bike_sharing'),
			boat: stop.flags.some(flag => flag.short_name === 'boat'),
			car_parking: stop.flags.some(flag => flag.short_name === 'car_parking'),
			light_rail: stop.flags.some(flag => flag.short_name === 'light_rail'),
			subway: stop.flags.some(flag => flag.short_name === 'subway'),
			train: stop.flags.some(flag => flag.short_name === 'train'),
		};

		const ttsStopName = makeStop(stop.name, modes);

		ttsSummary.push({
			stop_id: stop._id,
			stop_name: stop.name,
			tts_stop_name: ttsStopName,
		});

		if (stop.tts_stop_name !== ttsStopName) {
			stopsDiff.push(stop);
			stopsDiff.push({ ...stop, tts_stop_name: ttsStopName });
		}

		stopsUpdated.push({ ...stop, tts_stop_name: ttsStopName });

		//
	}

	// Save the formatted data into a CSV file
	process.stdout.clearLine(0);
	console.log('* Saving result to CSV file...');
	const ttsSummaryCsv = Papa.unparse(ttsSummary, {
		skipEmptyLines: 'greedy',
	});
	fs.writeFileSync('stops_tts_summary.txt', ttsSummaryCsv);
	const stopsUpdatedCsv = Papa.unparse(stopsUpdated, {
		skipEmptyLines: 'greedy',
	});
	fs.writeFileSync('stops_updated.txt', stopsUpdatedCsv);
	const stopsDiffCsv = Papa.unparse(stopsDiff, {
		skipEmptyLines: 'greedy',
	});
	fs.writeFileSync('stops_diff.txt', stopsDiffCsv);

	//

	Logger.success(`Processed ${ttsSummary.length} items (${globalTimer.get()}).`);

	//
})();
