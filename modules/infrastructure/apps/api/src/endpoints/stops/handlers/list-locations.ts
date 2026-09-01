/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type StopsLocationRequest, StopsLocationRequestSchema, type StopsLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type District, type DistrictFeature, type Locality, type LocalityFeature, type Municipality, type MunicipalityFeature, type Parish, type ParishFeature } from '@tmlmobilidade/go-types-locations';
import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';

/**
 * Get locations data for a given set of permissions.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listLocationsHandler(request: FastifyRequest<{ Body: StopsLocationRequest }>, reply: FastifyReply<StopsLocationResponse>) {
	//

	//
	// Validate the filters

	const validatedFilters = StopsLocationRequestSchema.parse(request.body);

	//
	// Get the municipality IDs from the permissions

	const resourceMunicipalityIds = validatedFilters.permissions.actions?.flatMap(action => request.permissions
		.filter(permission => permission.scope === validatedFilters.permissions.scope && permission.action === action)
		.flatMap(permission => 'resources' in permission && 'municipality_ids' in permission.resources ? permission.resources.municipality_ids ?? [] : []),
	) ?? [];

	//
	// Build aggregation pipeline for municipalities
	// and transform the result into a list of Municipality objects

	const matchedMunicipalityIds = !resourceMunicipalityIds.includes(AllowAllFlagValue)
		? { _id: { $in: resourceMunicipalityIds } }
		: {};

	const municipalitiesPipeline: AggregationPipeline<MunicipalityFeature> = [
		{ $match: matchedMunicipalityIds },
		{ $project: { _id: 1, properties: 1 } },
		{ $sort: { name: 1 } },
	];

	const municipalitiesAggregationResult = await goDb.locations.municipalities.aggregate(municipalitiesPipeline);

	const parsedMunicipalities: Municipality[] = municipalitiesAggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	//
	// Get the unique district and municipality IDs from the resulting list of allowed municipalities

	const uniqueMunicipalityIds = new Set(parsedMunicipalities.map(municipality => municipality._id));
	const uniqueDistrictIds = new Set(parsedMunicipalities.map(municipality => municipality.district_id));

	//
	// Build aggregation pipeline for districts from the list of municipalities
	// and transform the result into a list of District objects

	const districtsPipeline: AggregationPipeline<DistrictFeature> = [
		{ $match: { _id: { $in: Array.from(uniqueDistrictIds) } } },
		{ $project: { _id: 1, properties: 1 } },
		{ $sort: { name: 1 } },
	];

	const districtsAggregationResult = await goDb.locations.districts.aggregate(districtsPipeline);

	const parsedDistricts: District[] = districtsAggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	//
	// Build aggregation pipeline for parishes from the list of municipalities
	// and transform the result into a list of Parish objects

	const parishesPipeline: AggregationPipeline<ParishFeature> = [
		{ $match: { 'properties.municipality_id': { $in: Array.from(uniqueMunicipalityIds) } } },
		{ $project: { _id: 1, properties: 1 } },
		{ $sort: { name: 1 } },
	];

	const parishesAggregationResult = await goDb.locations.parishes.aggregate(parishesPipeline);

	const parsedParishes: Parish[] = parishesAggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	//
	// Build aggregation pipeline for localities from the list of municipalities
	// and transform the result into a list of Locality objects

	const localitiesPipeline: AggregationPipeline<LocalityFeature> = [
		{ $match: { 'properties.municipality_id': { $in: Array.from(uniqueMunicipalityIds) } } },
		{ $project: { _id: 1, properties: 1 } },
		{ $sort: { name: 1 } },
	];

	const localitiesAggregationResult = await goDb.locations.localities.aggregate(localitiesPipeline);

	const parsedLocalities: Locality[] = localitiesAggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	//
	// Parse and return the result

	if (!parsedMunicipalities?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No locations found for the given filters.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, {
		districts: parsedDistricts,
		localities: parsedLocalities,
		municipalities: parsedMunicipalities,
		parishes: parsedParishes,
	});
}

