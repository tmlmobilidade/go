/* * */

import { MongoConnector } from '@tmlmobilidade/mongo';
import { Logger } from '@tmlmobilidade/logger';
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
	Logger.info(`📖 Reading file from ${filePath}`);

	const raw = await fs.readFile(filePath, 'utf-8');
	const geojson = JSON.parse(raw);

	if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
		throw new Error('Invalid GeoJSON FeatureCollection');
	}

	Logger.info(`🔗 Connecting to collection: ${collectionName}`);
	const db = mongo.db('production');
	const collection = db.collection(collectionName);

	Logger.info(`🧹 Clearing collection: ${collectionName}`);
	await collection.deleteMany({});

	// 🚨 Insert the individual features, not the full object
	Logger.info(`💾 Inserting ${geojson.features.length} features into ${collectionName}`);
	for (const feature of geojson.features) {
		try {
			// 🚨 Skip invalid features for localities
			if (collectionName === 'localities' && !booleanValid(feature)) {
				Logger.error(`Invalid feature ${feature.properties.name} (${feature.properties.id})`);

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
			Logger.error(`Error inserting ${feature.properties.name} (${feature.properties.id})`, error);
		}
	}

	// ✅ Add geospatial index
	Logger.info(`🔍 Creating index for ${collectionName}`);
	await collection.createIndex({ geometry: '2dsphere' }, { });

	Logger.success(`✅ Seeded ${geojson.features.length} documents into ${collectionName}`);
}

// Usage example:

async function main() {
	try {
		Logger.divider('🚀 Locations seeder service started');

		Logger.title('🔗 Connecting to MongoDB');
		await mongo.connect();
		Logger.success('Connected to MongoDB');
		Logger.divider();

		Logger.title('🚀 Seeding collections');

		for (const collection of COLLECTIONS) {
			Logger.title(`🌱 Seeding ${collection}`);
			await seedGeoCollection(path.join(__dirname, `../data/${collection}.json`), collection);

			Logger.spacer(1);
			Logger.divider();
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
