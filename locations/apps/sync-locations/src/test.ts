// import { locations } from '@tmlmobilidade/interfaces';

// const lng = -9.1205183;
// const lat = 38.7173029;

// locations.findLocationByGeo(lat, lng, { census: true })
// 	.then(console.log)
// 	.catch(console.error)
// 	.finally(() => {
// 		process.exit(0);
// 	});

/* * */

import LOGGER from '@helperkits/logger';
import { MongoConnector } from '@tmlmobilidade/connectors';
import { booleanValid } from '@turf/boolean-valid';
import { feature as turfFeature } from '@turf/turf';
import fs from 'fs/promises';
import path from 'path';

// async function main() {
// 	const raw = await fs.readFile(path.join(__dirname, `../data/localities.json`), 'utf-8');
// 	const geojson = JSON.parse(raw);

// 	// Create the localities directory if it doesn't exist
// 	// const locality = path.join(__dirname, '../data/localities/022720.json');
// 	// const feature = JSON.parse(await fs.readFile(locality, 'utf-8'));

// 	for (const feature of geojson.features) {
// 		const localitiesDir = path.join(__dirname, '../data/localities');
// 		await fs.mkdir(localitiesDir, { recursive: true });
// 		if (!booleanValid(feature)) {
// 			LOGGER.error(`Invalid feature ${feature.properties.name} (${feature.properties.id}) - ${feature.geometry.type}`);
// 			// Write to file
// 			await fs.writeFile(path.join(__dirname, `../data/localities/${feature.properties.id}.json`), JSON.stringify(feature, null, 2), 'utf-8');
// 		}
// 	}
// }

async function main(id: string) {
	const raw = await fs.readFile(path.join(__dirname, `../data/localities.json`), 'utf-8');
	const geojson = JSON.parse(raw);

	// Create the localities directory if it doesn't exist
	const locality = path.join(__dirname, `../data/localities/${id}.json`);
	const feature = JSON.parse(await fs.readFile(locality, 'utf-8'));

	if (!booleanValid(feature)) {
		LOGGER.error(`Invalid feature ${feature.properties.name} (${feature.properties.id}) - ${feature.geometry.type}`);
		// Write to file
		// await fs.writeFile(path.join(__dirname, `../data/localities/${feature.properties.id}.json`), JSON.stringify(feature, null, 2), 'utf-8');
		// await fs.writeFile(path.join(__dirname, `../data/localities/${feature.properties.id}.json`), JSON.stringify(feature, null, 2), 'utf-8');
	}
}

const ID = '000252';
main(ID);
