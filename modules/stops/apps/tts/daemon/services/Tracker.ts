/* * */

import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';

/* * */

export interface TrackerItem {
	id: string
	tts: string
}

/* * */

const TRACKERS_DIRNAME = path.join(path.dirname(fileURLToPath(import.meta.url)), '../trackers');

const trackerPath = (name: string) => `${TRACKERS_DIRNAME}/tracker_${name}.csv`;

const init = (name: string) => {
	if (!fs.existsSync(TRACKERS_DIRNAME)) fs.mkdirSync(TRACKERS_DIRNAME, { recursive: true });
	if (!fs.existsSync(trackerPath(name))) fs.writeFileSync(trackerPath(name), 'id,tts\n');
};

/* * */

const read = (name: string): TrackerItem[] => {
	init(name);
	const trackerCsv = fs.readFileSync(trackerPath(name), { encoding: 'utf8' });
	const trackerPapa = Papa.parse<TrackerItem>(trackerCsv, { header: true, skipEmptyLines: true });
	return trackerPapa.data.filter(item => item.id);
};

/* * */

const get = (name: string): TrackerItem[] => {
	console.log(`* Reading tracker_${name}.csv file from disk...`);
	return read(name);
};

/* * */

const set = (name: string, data: TrackerItem[]) => {
	init(name);
	console.log(`* Saving tracker_${name}.csv file to disk...`);
	fs.writeFileSync(trackerPath(name), Papa.unparse(data, { skipEmptyLines: 'greedy' }));
};

/* * */

const upsert = (name: string, item: TrackerItem) => {
	init(name);
	const data = read(name);
	const index = data.findIndex(row => row.id === item.id);

	if (index >= 0) {
		if (data[index].tts === item.tts) return;

		data[index] = item;
		fs.writeFileSync(trackerPath(name), Papa.unparse(data, { skipEmptyLines: 'greedy' }));
		return;
	}

	fs.appendFileSync(trackerPath(name), `${Papa.unparse([item], { header: false })}\n`);
};

/* * */

export const Tracker = { get, set, upsert };
