/* * */

import { type Pool, PostgresDatabaseClient, type QueryResult, type QueryResultRow } from '@tmlmobilidade/go-clients-postgres';
import { asyncSingletonProxy } from '@tmlmobilidade/go-utils-exec';

import { FIND_LOCATIONS_AT_POINT, FIND_LOCATIONS_BY_COUNTRY_AND_ADMIN_LEVEL, FIND_LOCATIONS_WITH_GEOJSON_BY_COUNTRY_AND_ADMIN_LEVEL, FIND_NEAREST_LOCALITY } from './queries.js';
import { CountryCode, type Location, type LocationWithGeojson } from './types.js';

/* * */

class LocationsDbClass {
	//

	private static _instance: LocationsDbClass;

	private readonly postgresClient: Pool;

	private constructor(postgresClient: Pool) {
		this.postgresClient = postgresClient;
	}

	/**
	 * Establishes a connection to the PostGIS / PostgreSQL database.
	 * @throws Error if required LOCATIONSDB_* environment variables are missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!LocationsDbClass._instance) {
			const postgresClient = await PostgresDatabaseClient.getClient({ prefix: 'LOCATIONSDB', tunnelType: 'GO' });
			LocationsDbClass._instance = new LocationsDbClass(postgresClient);
		}
		return LocationsDbClass._instance;
	}

	/**
	 * Finds locations whose geometry covers a WGS84 point.
	 * Typically returns nested levels (country, district, municipality, parish).
	 */
	public async findLocationsAtPoint(longitude: number, latitude: number): Promise<Location[]> {
		const result = await this.postgresClient.query<Location>(
			FIND_LOCATIONS_AT_POINT,
			[longitude, latitude],
		);
		return result.rows;
	}

	/**
	 * Lists locations for a given OSM admin_level inside a country, sorted by name, without geometry.
	 * @param countryCode ISO 3166-1 alpha-2 country code.
	 * @param adminLevel OSM admin_level (e.g. `"7"` for Portuguese municipalities).
	 */
	public async findLocationsByCountryAndAdminLevel(countryCode: CountryCode, adminLevel: number | string): Promise<Location[]> {
		const result = await this.postgresClient.query<Location>(
			FIND_LOCATIONS_BY_COUNTRY_AND_ADMIN_LEVEL,
			[String(adminLevel), countryCode],
		);
		return result.rows;
	}

	/**
	 * Lists locations for a given OSM admin_level inside a country, including GeoJSON geometry.
	 * @param countryCode ISO 3166-1 alpha-2 country code.
	 * @param adminLevel OSM admin_level (e.g. `"7"` for Portuguese municipalities).
	 */
	public async findLocationsWithGeojsonByCountryAndAdminLevel(countryCode: CountryCode, adminLevel: number | string): Promise<LocationWithGeojson[]> {
		const result = await this.postgresClient.query<LocationWithGeojson>(
			FIND_LOCATIONS_WITH_GEOJSON_BY_COUNTRY_AND_ADMIN_LEVEL,
			[String(adminLevel), countryCode],
		);
		return result.rows;
	}

	/**
	 * Finds the nearest `place=locality` point within a radius of a WGS84 point.
	 * The returned row has `admin_level = "locality"`.
	 * @param maxDistanceMeters Search radius in metres.
	 */
	public async findNearestLocality(longitude: number, latitude: number, maxDistanceMeters: number): Promise<Location | null> {
		const result = await this.postgresClient.query<Location>(
			FIND_NEAREST_LOCALITY,
			[longitude, latitude, maxDistanceMeters],
		);
		return result.rows[0] ?? null;
	}

	/**
	 * Executes a SQL query against the locations database.
	 * @param text The SQL query text (supports `$1`, `$2`, … placeholders).
	 * @param params Optional positional query parameters.
	 * @returns The query result rows typed as `T`.
	 */
	public async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
		return await this.postgresClient.query<T>(text, params);
	}
}

/* * */

export const locationsDb = asyncSingletonProxy(LocationsDbClass);
