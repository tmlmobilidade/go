/* * */

import { municipalities } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function seedMunicipalities() {
	try {
		//

		//
		// Fetch the municipalities.json data

		const municipalitiesRes = await fetch('https://storage.carrismetropolitana.pt/static/locations/municipalities.json');
		const municipalitiesText = await municipalitiesRes.text();
		const municipalitiesData = JSON.parse(municipalitiesText);

		Logger.info(`Fetched ${municipalitiesData.length} municipalities from remote source.`);

		//
		// Parse the JSON data into
		// the Municipality format

		const parsedMunicipalities = municipalitiesData.map((item) => {
			console.log(item);
			process.exit(0);
		});

		Logger.info(`Parsed ${parsedMunicipalities.length} municipalities.`);

		//
		// Clear existing municipalities

		const deleteResult = await municipalities.deleteMany({});

		Logger.info(`Deleted ${deleteResult.deletedCount} existing municipalities.`);

		//
		// Insert municipalities data

		const insertResult = await municipalities.insertMany(parsedMunicipalities, { unsafe: true });

		Logger.info(`Inserted ${insertResult.insertedCount} municipalities.`);

		//
	}
	catch (error) {
		Logger.error('Error seeding municipalities:', error);
	}
}
