/* * */

import { FastifyReply, FastifyRequest } from '@tmlmobilidade/connectors-fastify';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { Filter, FindOptions, locations } from '@tmlmobilidade/interfaces';
import { District, GetAllDistrictsQuery, GetAllDistrictsQuerySchema, GetAllLocalitiesQuery, GetAllLocalitiesQuerySchema, GetAllMunicipalitiesQuery, GetAllMunicipalitiesQuerySchema, GetAllParishesQuery, GetAllParishesQuerySchema, Locality, Location, Municipality, Parish } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';

/**
 * This is an example controller that is using the locations interface.
 */
export class LocationsController {
	static async findByCoordinates(request: FastifyRequest, reply: FastifyReply<Location>) {
		const { census, lat, lon } = request.query as { census: boolean, lat: number, lon: number };

		try {
			const result = await locations.findLocationByGeo(Number(lat), Number(lon), { census: Boolean(census) });
			return reply.status(HttpStatus.OK).send({
				data: result,
				error: null,
				status: HttpStatus.OK,
			});
		}
		catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
			});
		}
	}

	static async getDistricts(request: FastifyRequest, reply: FastifyReply<District[]>) {
		const query = validateQueryParams<GetAllDistrictsQuery>(request.query, GetAllDistrictsQuerySchema);

		try {
			const options: FindOptions = { projection: { geometry: query.geojson === true ? 1 : 0 } };
			const districts = await locations.findDistricts({}, options);

			return reply.status(HttpStatus.OK).send({
				data: districts,
				error: null,
				status: HttpStatus.OK,
			});
		}
		catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
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

			const localities = await locations.findLocalities(filter, options);
			const total = await locations.countLocalities(filter);

			return reply.status(HttpStatus.OK).send({
				data: localities,
				error: null,
				pagination: {
					limit: query.limit,
					page: query.page,
					total,
				},
				status: HttpStatus.OK,
			});
		}
		catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
			});
		}
	}

	static async getMunicipalities(request: FastifyRequest, reply: FastifyReply<Municipality[]>) {
		const query = validateQueryParams<GetAllMunicipalitiesQuery>(request.query, GetAllMunicipalitiesQuerySchema);

		try {
			const filter: Filter<Municipality> = query.district_ids ? { district_id: { $in: query.district_ids } } : {};
			const options: FindOptions = { projection: { geometry: query.geojson === true ? 1 : 0 } };

			console.log('HERE =======> ', filter);

			const municipalities = await locations.findMunicipalities(filter, options);

			return reply.status(HttpStatus.OK).send({
				data: municipalities,
				error: null,
				status: HttpStatus.OK,
			});
		}
		catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
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

			const parishes = await locations.findParishes(filter, options);
			const total = await locations.countParishes(filter);

			return reply.status(HttpStatus.OK).send({
				data: parishes,
				error: null,
				pagination: {
					limit: query.limit,
					page: query.page,
					total,
				},
				status: HttpStatus.OK,
			});
		}
		catch (error) {
			if (error instanceof HttpException) {
				return reply.status(error.statusCode).send({
					data: undefined,
					error: error.message,
					status: error.statusCode,
				});
			}

			return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
				data: undefined,
				error: 'Internal server error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
			});
		}
	}
}
