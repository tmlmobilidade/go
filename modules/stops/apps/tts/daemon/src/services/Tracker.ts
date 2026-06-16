/* * */

import AdmZip from 'adm-zip';
import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

/* * */

export interface TrackerItem {
	id: string
	tts: string
}

/* * */

const TRACKERS_DIRNAME = '/app/trackers';

const init = (name: string) => {
	if (!fs.existsSync(TRACKERS_DIRNAME)) fs.mkdirSync(TRACKERS_DIRNAME, { recursive: true });
	if (!fs.existsSync(`${TRACKERS_DIRNAME}/tracker_${name}.csv`)) fs.writeFileSync(`${TRACKERS_DIRNAME}/tracker_${name}.csv`, '');
};

/* * */

const get = (name: string): TrackerItem[] => {
	init(name);
	console.log(`* Reading tracker_${name}.csv file from disk...`);
	const trackerCsv = fs.readFileSync(`${TRACKERS_DIRNAME}/tracker_${name}.csv`, { encoding: 'utf8' });
	const trackerPapa = Papa.parse<TrackerItem>(trackerCsv, { header: true });
	return trackerPapa.data;
};

/* * */

const set = (name: string, data: TrackerItem[]) => {
	init(name);
	console.log(`* Saving tracker_${name}.csv file to disk...`);
	const trackerCsvUpdated = Papa.unparse(data, { skipEmptyLines: 'greedy' });
	fs.writeFileSync(`${TRACKERS_DIRNAME}/tracker_${name}.csv`, trackerCsvUpdated);
};

/* * */

const clean = (name: string) => {
	console.log(`* Cleaning ${name}...`);
	const trackerData = get(name);
	const allTrackerItemIds = trackerData.map(item => String(item.id));
	const directoryContents = fs.readdirSync(`${OUTPUTS_DIRNAME}/${name}/`, { withFileTypes: true });
	for (const existingFile of directoryContents) {
		const filenameWithoutExtension = path.parse(existingFile.name).name;
		if (allTrackerItemIds.includes(filenameWithoutExtension)) continue;
		fs.rmSync(`${OUTPUTS_DIRNAME}/${name}/${existingFile.name}`, { force: true, recursive: true });
	}
};

/* * */

const zip = (name: string) => {
	console.log(`* Zipping ${name}...`);
	const outputZip = new AdmZip();
	outputZip.addLocalFolder(`${OUTPUTS_DIRNAME}/${name}/`);
	outputZip.writeZip(`${OUTPUTS_DIRNAME}/${name}/all.zip`);
};

/* * */

export const Tracker = { clean, get, set, zip };
