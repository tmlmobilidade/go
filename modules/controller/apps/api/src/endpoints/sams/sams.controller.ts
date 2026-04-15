/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams, SAMS_ANALYSIS_LIST_TAIL, SAMS_DEVICE_SEARCH_REGEX, SAMS_VEHICLE_SEARCH_REGEX, samsApexVersionsAggregationPipeline, samsBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { ActionsOf, type GetSamsBatchQuery, GetSamsBatchQuerySchema, Permission, PermissionCatalog, type Sam } from '@tmlmobilidade/types';

/* * */

/**
 * Escapes a regex string.
 */
function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parses the vehicle search query and returns an array of vehicle IDs.
 * @param searchRaw - The search query string.
 * @returns An array of vehicle IDs.
 */
function parseSamsVehicleSearch(searchRaw: string): number[] {
	const normalizedSearch = searchRaw.trim();
	const regexMatch = SAMS_VEHICLE_SEARCH_REGEX.exec(normalizedSearch);
	if (!regexMatch?.groups?.vehicleIds) return [];

	return [
		...new Set(
			regexMatch.groups.vehicleIds
				.split(',')
				.map(item => Number(item.trim()))
				.filter(item => Number.isInteger(item)),
		),
	];
}

/**
 * Parses the device search query and returns an array of device IDs.
 * @param searchRaw - The search query string.
 * @returns An array of device IDs.
 */
function parseSamsDeviceSearch(searchRaw: string): string[] {
	const normalizedSearch = searchRaw.trim();
	const regexMatch = SAMS_DEVICE_SEARCH_REGEX.exec(normalizedSearch);
	if (!regexMatch?.groups?.deviceIds) return [];

	return [
		...new Set(
			regexMatch.groups.deviceIds
				.split(',')
				.map(item => item.trim())
				.filter(Boolean),
		),
	];
}

/* * */

/**
 * Reserved query fields that are not used in the aggregation pipeline.
 */
const RESERVED_QUERY_FIELDS = new Set(['agency_ids', 'limit', 'offset', 'search']);
const RANGE_QUERY_FIELDS = {
	seen_first_at: { field: 'seen_first_at', operator: '$gte' },
	seen_last_at: { field: 'seen_last_at', operator: '$lte' },
} as const;

/**
 * A type for the batch list item.
 */
type SamBatchListItem = Omit<Sam, 'analysis'> & {
	analysis: Array<{
		end_time: null | number
		first_transaction_id: null | string
		start_time: null | number
	}>
};

/**
 * Builds the match for the SAMs.
 * @param parsedQuery - The parsed query.
 * @param options - The options.
 * @returns The match.
 */
function buildSamsMatch(parsedQuery: GetSamsBatchQuery, options: { includeApexVersionFilter?: boolean } = {}): Record<string, unknown>[] {
	const { includeApexVersionFilter = true } = options;
	const matchAnd: Record<string, unknown>[] = [];

	const agencyIdsForMatch = parsedQuery.agency_ids.filter(
		id => id !== PermissionCatalog.ALLOW_ALL_FLAG,
	);
	if (agencyIdsForMatch.length > 0) {
		matchAnd.push({ agency_id: { $in: agencyIdsForMatch } });
	}

	const searchRaw = parsedQuery.search?.trim() ?? '';
	if (searchRaw.length > 0) {
		const vehicleIds = parseSamsVehicleSearch(searchRaw);
		if (vehicleIds.length > 0) {
			matchAnd.push({
				$or: [
					{ vehicle_id: { $in: vehicleIds } },
					{ 'analysis.vehicle_id': { $in: vehicleIds } },
				],
			});
		} else {
			const deviceIds = parseSamsDeviceSearch(searchRaw);
			if (deviceIds.length > 0) {
				matchAnd.push({
					$or: [
						{ device_id: { $in: deviceIds } },
						{ 'analysis.device_id': { $in: deviceIds } },
					],
				});
			} else {
				const escaped = escapeRegex(searchRaw);
				matchAnd.push({
					$or: [
						{ $expr: { $regexMatch: { input: { $toString: '$_id' }, options: 'i', regex: escaped } } },
						{ agency_id: { $options: 'i', $regex: escaped } },
						{ 'analysis.first_transaction_id': { $options: 'i', $regex: escaped } },
						{ 'analysis.last_transaction_id': { $options: 'i', $regex: escaped } },
					],
				});
			}
		}
	}

	for (const [key, value] of Object.entries(parsedQuery)) {
		if (RESERVED_QUERY_FIELDS.has(key) || value === undefined || value === null || value === '')
			continue;
		if (!includeApexVersionFilter && key === 'latest_apex_version')
			continue;

		if (key in RANGE_QUERY_FIELDS) {
			const rangeKey = key as keyof typeof RANGE_QUERY_FIELDS;
			const rangeConfig = RANGE_QUERY_FIELDS[rangeKey];
			matchAnd.push({ [rangeConfig.field]: { [rangeConfig.operator]: value } });
			continue;
		}

		if (Array.isArray(value)) {
			if (value.length > 0) {
				if (key === 'latest_apex_version') {
					matchAnd.push({ latest_apex_version: { $in: value } });
					continue;
				}
				matchAnd.push({ [key]: { $in: value } });
			}
			continue;
		}

		matchAnd.push({ [key]: value });
	}

	return matchAnd;
}

/* * */

export class SamsController {
	/**
	 * Returns distinct `latest_apex_version` values from SAM documents (list filter).
	 */
	static async getApexVersions(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const matchAnd = buildSamsMatch(parsedQuery, { includeApexVersionFilter: false });

		const pipeline = samsApexVersionsAggregationPipeline({ matchAnd });

		const rows = (await sams.aggregate(pipeline)) as Array<{ _id: unknown }>;
		return reply.send({
			data: rows.map(item => String(item._id)),
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	static async getBatch(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamBatchListItem[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const pagedQuery = parsedQuery as GetSamsBatchQuery & { limit?: number, offset?: number };
		const pageOffset = pagedQuery.offset ?? 0;
		const matchAnd = buildSamsMatch(parsedQuery);

		const pipeline = samsBatchAggregationPipeline({
			analysisListTail: SAMS_ANALYSIS_LIST_TAIL,
			matchAnd,
			pageLimit: parsedQuery.limit,
			pageOffset,
		});

		const allSams = (await sams.aggregate(pipeline)) as SamBatchListItem[];

		return reply.send({
			data: allSams,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Returns a SAM by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getById(request: FastifyRequest, reply: FastifyReply<Sam>) {
		//
		// Validate the request parameters

		const { id } = request.params as { id: string };

		if (!id || isNaN(Number(id))) {
			return reply.status(HTTP_STATUS.BAD_REQUEST).send({ data: null, error: 'Missing id parameter.', statusCode: HTTP_STATUS.BAD_REQUEST });
		}

		//
		// Fetch the SAM from the database

		const sam = await sams.findById(Number(id));

		if (!sam) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({ data: null, error: 'SAM not found.', statusCode: HTTP_STATUS.NOT_FOUND });
		}

		//
		// Return the SAM

		return reply.send({ data: sam, error: null, statusCode: HTTP_STATUS.OK });
	}

	/* * */

	/**
	 * Returns a list of SAMs by IDs.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 * @param scope The scope of the permission.
	 * @param action The action of the permission.
	 */
	static async getSamByIds<S extends Permission['scope']>(request: FastifyRequest, reply: FastifyReply<Sam[]>, scope: S, action: ActionsOf<S>) {
		//
		// Resolve SAMs for stored favorite ids. `SamsPermission` has no `resources` today — treat missing
		// `agency_ids` like list batch default (no agency restriction). When resources exist, match rides.

		void scope;
		void action;

		const samsPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read);

		if (!samsPermission) {
			return reply.status(HTTP_STATUS.FORBIDDEN).send({ data: null, error: 'Insufficient permissions.', statusCode: HTTP_STATUS.FORBIDDEN });
		}

		const agencyIds = (samsPermission as Permission & { resources?: { agency_ids?: string[] } }).resources?.agency_ids;
		const restrictByAgency = Array.isArray(agencyIds) && agencyIds.length > 0;
		const allowAllAgencies = !restrictByAgency || (agencyIds?.includes(PermissionCatalog.ALLOW_ALL_FLAG) ?? false);

		const numericIds = (request.query['ids']?.split(',') ?? [])
			.map(part => part.trim())
			.filter(Boolean)
			.map(Number)
			.filter(id => Number.isInteger(id));

		if (numericIds.length === 0) {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const foundSamsByIds = await sams.findMany({
			_id: { $in: numericIds },
			...(!allowAllAgencies && agencyIds?.length ? { agency_id: { $in: agencyIds } } : {}),
		});

		return reply.send({ data: foundSamsByIds.map(sam => sam), error: null, statusCode: HTTP_STATUS.OK });
	}
}
