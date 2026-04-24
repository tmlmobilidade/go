/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable perfectionist/sort-classes */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { type AvailableLocations, type CensusFeature, type District, type DistrictFeature, type Locality, type LocalityFeature, type Location, type Municipality, type MunicipalityFeature, type Parish, type ParishFeature } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { Collection, Document, Filter, FindOptions, WithId } from 'mongodb';

/* * */

class LocationsClass {
	private static _instance: LocationsClass;
	private collections: { [K in keyof AvailableLocations]: Collection<AvailableLocations[K]> };

	private mongoConnector: MongoConnector;

	private constructor() {
		this.collections = {} as typeof this.collections;
	}

	public static async getInstance() {
		if (!this._instance) {
			const instance = new LocationsClass();
			await instance.connect();
			this._instance = instance;
		}
		return this._instance;
	}

	/*  Public Methods */

	/* Count */
	public countCensus = async (filter?: Filter<CensusFeature>): Promise<number> =>
		await this.count(this.collections.census, filter);

	public countDistricts = async (filter?: Filter<District>): Promise<number> => {
		const _filter = this.convertFilter<District, DistrictFeature>(filter);
		return await this.count(this.collections.districts, _filter);
	};

	public countLocalities = async (filter?: Filter<Locality>): Promise<number> => {
		const _filter = this.convertFilter<Locality, LocalityFeature>(filter);
		return await this.count(this.collections.localities, _filter);
	};

	public countMunicipalities = async (filter?: Filter<Municipality>): Promise<number> => {
		const _filter = this.convertFilter<Municipality, MunicipalityFeature>(filter);
		return await this.count(this.collections.municipalities, _filter);
	};

	public countParishes = async (filter?: Filter<Parish>): Promise<number> => {
		const _filter = this.convertFilter<Parish, ParishFeature>(filter);
		return await this.count(this.collections.parishes, _filter);
	};

	/*  Find All */
	public findCensus = async (filter?: Filter<CensusFeature>, options?: FindOptions): Promise<WithId<CensusFeature>[]> =>
		await this.findMany(this.collections.census, filter, options);

	public findDistricts = async (filter?: Filter<District>, options?: FindOptions): Promise<District[]> => {
		const _filter = this.convertFilter<District, DistrictFeature>(filter);

		const documents = await this.findMany(this.collections.districts, _filter, options);
		return documents.map(doc => this.transformDocument<DistrictFeature, District>(doc));
	};

	public findLocalities = async (filter?: Filter<Locality>, options?: FindOptions): Promise<Locality[]> => {
		const _filter = this.convertFilter<Locality, LocalityFeature>(filter);

		const documents = await this.findMany(this.collections.localities, _filter, options);
		return documents.map(doc => this.transformDocument<LocalityFeature, Locality>(doc));
	};

	public findMunicipalities = async (filter?: Filter<Municipality>, options?: FindOptions): Promise<Municipality[]> => {
		const _filter = this.convertFilter<Municipality, MunicipalityFeature>(filter);

		const documents = await this.findMany(this.collections.municipalities, _filter, options);
		return documents.map(doc => this.transformDocument<MunicipalityFeature, Municipality>(doc));
	};

	public findParishes = async (filter?: Filter<Parish>, options?: FindOptions): Promise<Parish[]> => {
		const _filter = this.convertFilter<Parish, ParishFeature>(filter);

		const documents = await this.findMany(this.collections.parishes, _filter, options);
		return documents.map(doc => this.transformDocument<ParishFeature, Parish>(doc));
	};

	/*  Find By Id */
	public findCensusById = async (id: string, options?: FindOptions): Promise<null | WithId<CensusFeature>> =>
		await this.findById(this.collections.census, id, options);

	public findDistrictById = async (id: string, options?: FindOptions): Promise<District | null> => {
		const document = await this.findById(this.collections.districts, id, options);
		return document ? this.transformDocument<DistrictFeature, District>(document) : null;
	};

	public findLocalityById = async (id: string, options?: FindOptions): Promise<Locality | null> => {
		const document = await this.findById(this.collections.localities, id, options);
		return document ? this.transformDocument<LocalityFeature, Locality>(document) : null;
	};

	public findMunicipalityById = async (id: string, options?: FindOptions): Promise<Municipality | null> => {
		const document = await this.findById(this.collections.municipalities, id, options);
		return document ? this.transformDocument<MunicipalityFeature, Municipality>(document) : null;
	};

	public findParishById = async (id: string, options?: FindOptions): Promise<null | Parish> => {
		const document = await this.findById(this.collections.parishes, id, options);
		return document ? this.transformDocument<ParishFeature, Parish>(document) : null;
	};

	/*  Find By Geo */
	public findMunicipalitiesByGeo = async (lat: number, lon: number, options?: FindOptions): Promise<Municipality | null> => {
		const document = await this.findOne(this.collections.municipalities, this.geoFilter(lat, lon), options);
		return document ? this.transformDocument<MunicipalityFeature, Municipality>(document) : null;
	};

	public findParishesByGeo = async (lat: number, lon: number, options?: FindOptions): Promise<null | Parish> => {
		const document = await this.findOne(this.collections.parishes, this.geoFilter(lat, lon), options);
		return document ? this.transformDocument<ParishFeature, Parish>(document) : null;
	};

	public findDistrictsByGeo = async (lat: number, lon: number, options?: FindOptions): Promise<District | null> => {
		const document = await this.findOne(this.collections.districts, this.geoFilter(lat, lon), options);
		return document ? this.transformDocument<DistrictFeature, District>(document) : null;
	};

	public findLocalitiesByGeo = async (lat: number, lon: number, options?: FindOptions): Promise<Locality | null> => {
		const document = await this.findOne(this.collections.localities, this.geoFilter(lat, lon), options);
		return document ? this.transformDocument<LocalityFeature, Locality>(document) : null;
	};

	public findCensusByGeo = async (lat: number, lon: number, options?: FindOptions): Promise<null | WithId<CensusFeature>> =>
		await this.findOne(this.collections.census, this.geoFilter(lat, lon), options);

	public async findLocationByGeo(lat: number, lon: number, { census = false }: { census?: boolean } = {}): Promise<Location> {
		if (!lat || !lon) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing latitude or longitude');

		const municipality = await this.findMunicipalitiesByGeo(lat, lon, { projection: { _id: 1, properties: 1 } });
		const parish = await this.findParishesByGeo(lat, lon, { projection: { _id: 1, properties: 1 } });
		const district = await this.findDistrictsByGeo(lat, lon, { projection: { _id: 1, properties: 1 } });
		const locality = await this.findLocalitiesByGeo(lat, lon, { projection: { _id: 1, properties: 1 } });
		const _census = census ? await this.findCensusByGeo(lat, lon, { projection: { _id: 1, properties: 1 } }) : undefined;

		return {
			census: { ..._census?.properties, _id: _census?._id },
			district: district,
			latitude: lat,
			locality: locality,
			longitude: lon,
			municipality: municipality,
			parish: parish,
		};
	};

	/*  Private Methods - Database Connection */

	private async connect() {
		const dbUri = process.env.DATABASE_URI;
		if (!dbUri) throw new Error(`Missing DATABASE_URI environment variable`);

		try {
			this.mongoConnector = new MongoConnector(dbUri);
			await this.mongoConnector.connect();
			const db = this.mongoConnector.client.db('production');

			this.collections = {
				census: db.collection<CensusFeature>('census'),
				districts: db.collection<DistrictFeature>('districts'),
				localities: db.collection<LocalityFeature>('localities'),
				municipalities: db.collection<MunicipalityFeature>('municipalities'),
				parishes: db.collection<ParishFeature>('parishes'),
			};
		} catch (error) {
			throw new Error(`Error connecting to MongoDB`, { cause: error });
		}
	}

	/*  Private Methods - Database Operations */

	private async findById<T extends Document>(collection: Collection<T>, id: string, options?: FindOptions): Promise<null | WithId<T>> {
		return collection.findOne({ _id: { $eq: id } } as Filter<T>, options);
	}

	private async findMany<T extends Document>(collection: Collection<T>, filter: Filter<T> = {}, options?: FindOptions): Promise<WithId<T>[]> {
		const query = collection.find(filter, options);
		return query.toArray();
	}

	private async findOne<T extends Document>(collection: Collection<T>, filter: Filter<T>, options?: FindOptions): Promise<null | WithId<T>> {
		return collection.findOne(filter, options);
	}

	private async count<T extends Document>(collection: Collection<T>, filter: Filter<T> = {}): Promise<number> {
		return collection.countDocuments(filter);
	}

	private geoFilter = (lat: number, lon: number) => ({ geometry: { $geoIntersects: { $geometry: { coordinates: [lon, lat], type: 'Point' } } } });

	private transformDocument<T extends Omit<AvailableLocations[keyof AvailableLocations], 'census'>, U = District | Locality | Municipality | Parish>(doc: WithId<T>): U {
		const geojson = doc.geometry ? {
			geometry: doc.geometry,
			properties: {},
			type: doc.type,
		} : undefined;

		return {
			_id: doc._id,
			...doc?.properties,
			geojson,
		} as U;
	}

	private convertFilterField = (key: string): string => {
		if (key.startsWith('geojson.geometry')) return key.replace('geojson.geometry', 'geometry');
		if (key.startsWith('geojson.type')) return key.replace('geojson.type', 'type');
		if (key.startsWith('geojson')) return key.replace('geojson', ''); // fallback
		if (!key.startsWith('_id')) return `properties.${key}`;
		return key;
	};

	private convertFilter = <T, U>(filter?: Filter<T>): Filter<U> | undefined => {
		if (!filter || typeof filter !== 'object') return filter as unknown as Filter<U>;

		if (Array.isArray(filter)) {
			return filter.map(this.convertFilter) as Filter<Record<string, any>>;
		}

		const output: Filter<Record<string, any>> = {};

		for (const [key, value] of Object.entries(filter)) {
			if (key.startsWith('$')) {
			// Recursive operator like $and, $or, $nor
				if (Array.isArray(value)) {
					output[key] = value.map(this.convertFilter);
				} else if (typeof value === 'object') {
					output[key] = this.convertFilter(value);
				} else {
					output[key] = value;
				}
			} else {
				const newKey = this.convertFilterField(key);

				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					output[newKey] = this.convertFilter(value); // nested operator (e.g., $gt)
				} else {
					output[newKey] = value;
				}
			}
		}

		return output;
	};
}

/* * */

export const locations = asyncSingletonProxy(LocationsClass);
