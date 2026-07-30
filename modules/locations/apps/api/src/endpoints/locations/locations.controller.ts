/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Filter, type FindOptions } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type District, type GetAllDistrictsQuery, GetAllDistrictsQuerySchema, type GetAllLocalitiesQuery, GetAllLocalitiesQuerySchema, type GetAllMunicipalitiesQuery, GetAllMunicipalitiesQuerySchema, type GetAllParishesQuery, GetAllParishesQuerySchema, type Locality, type Location, type Municipality, type Parish } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';

/**
 * This is an example controller that is using the locations interface.
 */
export class LocationsController {
	static async findByCoordinates(request: FastifyRequest, reply: FastifyReply<Location>) {
		const { lat, lon } = request.query as { lat: number, lon: number };
		Logger.info({ message: `Received coordinates: ${lat}, ${lon}` });
		try {
			const result = await locationsProvider.findLocationByGeo(Number(lat), Number(lon));
			return reply.status(HTTP_STATUS.OK).send({
				data: result,
				error: null,
				status: HTTP_STATUS.OK,
			});
		} catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			});
		}
	}

	static async getDistricts(request: FastifyRequest, reply: FastifyReply<District[]>) {
		const query = validateQueryParams<GetAllDistrictsQuery>(request.query, GetAllDistrictsQuerySchema);

		try {
			const options: FindOptions = { projection: { geometry: query.geojson === true ? 1 : 0 } };
			const districts = await goDb.locations.districts.findMany({}, options);

			return reply.status(HTTP_STATUS.OK).send({
				data: districts,
				error: null,
				status: HTTP_STATUS.OK,
			});
		} catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			});
		}
	}

	static async getLocalities(request: FastifyRequest, reply: FastifyReply<Locality[]>) {
		const query = validateQueryParams<GetAllLocalitiesQuery>(request.query, GetAllLocalitiesQuerySchema);

		try {
			const filter: Filter<Locality> = {};
			if (query.district_ids) filter.district_id = { $in: query.district_ids };
			if (query.municipality_ids) filter.municipality_id = { $in: query.municipality_ids };
			if (query.parish_ids) filter.parish_id = { $in: query.parish_ids };

			const options: FindOptions = {
				limit: query.limit,
				projection: { geometry: query.geojson === true ? 1 : 0 },
				skip: (query.page - 1) * query.limit,
			};

			const localities = await goDb.locations.localities.findMany(filter, options);
			const total = await goDb.locations.localities.count(filter);

			return reply.status(HTTP_STATUS.OK).send({
				data: localities,
				error: null,
				pagination: {
					limit: query.limit,
					page: query.page,
					total,
				},
				status: HTTP_STATUS.OK,
			});
		} catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			});
		}
	}

	static async getMunicipalities(request: FastifyRequest, reply: FastifyReply<Municipality[]>) {
		const query = validateQueryParams<GetAllMunicipalitiesQuery>(request.query, GetAllMunicipalitiesQuerySchema);

		try {
			const filter: Filter<Municipality> = query.district_ids ? { district_id: { $in: query.district_ids } } : {};
			const options: FindOptions = { projection: { geometry: query.geojson === true ? 1 : 0 } };

			const municipalities = await goDb.locations.municipalities.findMany(filter, options);

			return reply.status(HTTP_STATUS.OK).send({
				data: municipalities,
				error: null,
				status: HTTP_STATUS.OK,
			});
		} catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			});
		}
	}

	static async getParishes(request: FastifyRequest, reply: FastifyReply<Parish[]>) {
		const query = validateQueryParams<GetAllParishesQuery>(request.query, GetAllParishesQuerySchema);

		try {
			const filter: Filter<Parish> = {};
			if (query.district_ids) filter.district_id = { $in: query.district_ids };
			if (query.municipality_ids) filter.municipality_id = { $in: query.municipality_ids };

			const options: FindOptions = {
				limit: query.limit,
				projection: { geometry: query.geojson === true ? 1 : 0 },
				skip: (query.page - 1) * query.limit,
			};

			const parishes = await goDb.locations.parishes.findMany(filter, options);
			const total = await goDb.locations.parishes.count(filter);

			return reply.status(HTTP_STATUS.OK).send({
				data: parishes,
				error: null,
				pagination: {
					limit: query.limit,
					page: query.page,
					total,
				},
				status: HTTP_STATUS.OK,
			});
		} catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			});
		}
	}
}
