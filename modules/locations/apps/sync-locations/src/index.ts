/* * */

import { MongoConnector } from '@go/connectors-mongo';
import { Logger } from '@go/logger';
import { booleanValid } from '@turf/turf';
import { feature as turfFeature } from '@turf/turf';
import fs from 'fs/promises';
import path from 'path';

/* * */

if (!process.env.TML_INTERFACE_LOCATIONS) {
	throw new Error('TML_INTERFACE_LOCATIONS environment variable is not set');
}

const mongo = new MongoConnector(process.env.TML_INTERFACE_LOCATIONS);

/* * */

const COLLECTIONS = ['census', 'districts', 'localities', 'municipalities', 'parishes'] as const;

async function seedGeoCollection(filePath: string, collectionName: (typeof COLLECTIONS)[number]) {
	LOGGER.info(`📖 Reading file from ${filePath}`);

	const raw = await fs.readFile(filePath, 'utf-8');
	const geojson = JSON.parse(raw);

	if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
		throw new Error('Invalid GeoJSON FeatureCollection');
	}

	LOGGER.info(`🔗 Connecting to collection: ${collectionName}`);
	const db = mongo.db('production');
	const collection = db.collection(collectionName);

	LOGGER.info(`🧹 Clearing collection: ${collectionName}`);
	await collection.deleteMany({});

	// 🚨 Insert the individual features, not the full object
	LOGGER.info(`💾 Inserting ${geojson.features.length} features into ${collectionName}`);
	for (const feature of geojson.features) {
		try {
			// 🚨 Skip invalid features for localities
			if (collectionName === 'localities' && !booleanValid(feature)) {
				LOGGER.error(`Invalid feature ${feature.properties.name} (${feature.properties.id})`);

				// Fix Feature
				// continue;
			}

			const geojson = turfFeature(feature.geometry, feature.properties);

			const object = {
				_id: collectionName === 'census' ? feature.properties.fid : feature.properties.id,
				...(() => {
					const { properties: { fid, id, ...rest }, ...rest2 } = geojson;
					return {
						...rest2,
						properties: {
							...rest,
						},
					};
				})(),
			};

			await collection.insertOne(object, {});
		}
		catch (error) {
			LOGGER.error(`Error inserting ${feature.properties.name} (${feature.properties.id})`, error);
		}
	}

	// ✅ Add geospatial index
	LOGGER.info(`🔍 Creating index for ${collectionName}`);
	await collection.createIndex({ geometry: '2dsphere' }, { });

	LOGGER.success(`✅ Seeded ${geojson.features.length} documents into ${collectionName}`);
}

// Usage example:

async function main() {
	try {
		LOGGER.divider('🚀 Locations seeder service started');

		LOGGER.title('🔗 Connecting to MongoDB');
		await mongo.connect();
		LOGGER.success('Connected to MongoDB');
		LOGGER.divider();

		LOGGER.title('🚀 Seeding collections');

		for (const collection of COLLECTIONS) {
			LOGGER.title(`🌱 Seeding ${collection}`);
			await seedGeoCollection(path.join(__dirname, `../data/${collection}.json`), collection);

			LOGGER.spacer(1);
			LOGGER.divider();
		}
	}
	catch (error) {
		console.error(error);
		process.exit(1);
	}
	finally {
		await mongo.disconnect();
		process.exit(0);
	}
}

main();
