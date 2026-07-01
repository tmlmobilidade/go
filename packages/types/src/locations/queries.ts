/* * */

import { type Census, type CensusFeature } from '@/locations/census.js';
import { type District, type DistrictFeature } from '@/locations/district.js';
import { type Locality, type LocalityFeature } from '@/locations/locality.js';
import { type Municipality, type MunicipalityFeature } from '@/locations/municipality.js';
import { type Parish, type ParishFeature } from '@/locations/parish.js';
import { PaginationSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/**
 * This type represents the location collections available in the database,
 * with each collection corresponding to a specific geographic entity.
 */
export interface AvailableLocations {
	census: CensusFeature
	districts: DistrictFeature
	localities: LocalityFeature
	municipalities: MunicipalityFeature
	parishes: ParishFeature
}

/**
 * This type represents the aggregated location information,
 * combining various geographic entities into a single structure.
 * Useful for location-based queries (coordinates) and data retrieval.
 */
export interface Location {
	census?: Census | null
	district: District | null
	latitude: number
	locality: Locality | null
	longitude: number
	municipality: Municipality | null
	parish: null | Parish
}

/* * */

export const GetAllDistrictsQuerySchema = z.object({
	geojson: z.preprocess(
		(val: string) => val === 'true' || val === '1',
		z.boolean(),
	),
});

/**
 * This type represents the query parameters for fetching all Districts
 * from the database, including an optional flag to include GeoJSON data.
 */
export type GetAllDistrictsQuery = z.infer<typeof GetAllDistrictsQuerySchema>;

/* * */

export const GetAllMunicipalitiesQuerySchema = GetAllDistrictsQuerySchema.extend({
	district_ids: z
		.preprocess(
			val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
			z.array(z.string()).nullish(),
		),
});

/**
 * This type represents the query parameters for fetching all Municipalities
 * from the database, including optional filters for District IDs and a flag
 * to include GeoJSON data.
 */
export type GetAllMunicipalitiesQuery = z.infer<typeof GetAllMunicipalitiesQuerySchema>;

/* * */

export const GetAllParishesQuerySchema = GetAllMunicipalitiesQuerySchema.extend({
	municipality_ids: z
		.preprocess(
			val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
			z.array(z.string()).nullish(),
		),
}).extend(PaginationSchema.shape);

/**
 * This type represents the query parameters for fetching all Parishes
 * from the database, including optional filters for Municipality IDs,
 * pagination options, and a flag to include GeoJSON data.
 */
export type GetAllParishesQuery = z.infer<typeof GetAllParishesQuerySchema>;

/* * */

export const GetAllLocalitiesQuerySchema = GetAllParishesQuerySchema.extend({ parish_ids: z.preprocess(
	val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val,
	z.array(z.string()).nullish(),
),
}).extend(PaginationSchema.shape);

/**
 * This type represents the query parameters for fetching all Localities
 * from the database, including optional filters for Parish IDs,
 * pagination options, and a flag to include GeoJSON data.
 */
export type GetAllLocalitiesQuery = z.infer<typeof GetAllLocalitiesQuerySchema>;
