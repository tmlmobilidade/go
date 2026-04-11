import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { lines, rides } from '@tmlmobilidade/interfaces';
import { type Line, PermissionCatalog } from '@tmlmobilidade/types';
import { z } from 'zod';

export interface LineByHashedTrip {
	hashed_trip_ids: string[]
	line_id: number
	line_long_name: string
	line_short_name: string
}

const GetLinesByHashedTripQuerySchema = z.object({
	agency_id: z.string().optional(),
	date_end: z.union([z.number(), z.string()]).optional().transform(value => value !== undefined ? Number(value) : undefined),
	date_start: z.union([z.number(), z.string()]).optional().transform(value => value !== undefined ? Number(value) : undefined),
	hashed_trip_ids: z.union([z.string(), z.array(z.string())]).optional(),
});

export type GetLinesByHashedTripQuery = z.infer<typeof GetLinesByHashedTripQuerySchema>;

export class LinesSharedController {
	//

	/**
	 * Gets all Lines.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Line[]>) {
		//
		// Get all lines

		const allLines = await lines.findMany({}, { sort: { created_at: -1 } }) as Line[];

		//
		// Get the resource permissions for lines for the current user.

		const linesPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		if (!linesPermission) return reply.send({ data: allLines, error: null, statusCode: HTTP_STATUS.OK });

		//
		// Send the response

		reply.send({ data: allLines, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	//

	/**
	 * Get all lines ids with all hashed_trips used in rides.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getAllLinesIdsByHashedTrip(request: FastifyRequest<{ Querystring: GetLinesByHashedTripQuery }>, reply: FastifyReply<LineByHashedTrip[]>) {
		//
		// Resolve hashed trip ids from query directly or by rides filters (date/agency).

		const parsedQuery = GetLinesByHashedTripQuerySchema.parse(request.query);
		const parsedDateStart = parsedQuery.date_start;
		const parsedDateEnd = parsedQuery.date_end;
		const hasDateRangeFilters = Number.isFinite(parsedDateStart) && Number.isFinite(parsedDateEnd);
		const hasAgencyFilter = Boolean(parsedQuery.agency_id);

		const hashedTripIdsQuery = parsedQuery.hashed_trip_ids
			? (Array.isArray(parsedQuery.hashed_trip_ids) ? parsedQuery.hashed_trip_ids : [parsedQuery.hashed_trip_ids])
			: [];
		const filteredHashedTripIds = hashedTripIdsQuery.filter(Boolean);
		const hasHashedTripIds = filteredHashedTripIds.length > 0;

		if (!hasHashedTripIds && !(hasDateRangeFilters && hasAgencyFilter)) {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const ridesMatchStage: Record<string, unknown> = {};

		if (hasHashedTripIds) {
			ridesMatchStage.hashed_trip_id = { $in: filteredHashedTripIds };
		} else if (hasDateRangeFilters && parsedQuery.agency_id) {
			ridesMatchStage.start_time_scheduled = { $gte: parsedDateStart, $lte: parsedDateEnd };
			ridesMatchStage.agency_id = parsedQuery.agency_id;
		}

		const aggregatedLines = await rides.aggregate([
			{ $match: ridesMatchStage },
			{
				$lookup: {
					as: 'hashed_trip',
					foreignField: '_id',
					from: 'hashed_trips',
					localField: 'hashed_trip_id',
				},
			},
			{ $unwind: '$hashed_trip' },
			{ $sort: { hashed_trip_id: 1 } },
			{
				$group: {
					_id: '$hashed_trip.line_id',
					hashed_trip_ids: { $addToSet: '$hashed_trip_id' },
					line_long_name: { $first: '$hashed_trip.line_long_name' },
					line_short_name: { $first: '$hashed_trip.line_short_name' },
				},
			},
			{
				$addFields: {
					line_id: '$_id',
				},
			},
			{
				$project: {
					_id: 0,
					hashed_trip_ids: 1,
					line_id: 1,
					line_long_name: 1,
					line_short_name: 1,
				},
			},
			{ $sort: { line_id: 1 } },
		]) as unknown as LineByHashedTrip[];

		return reply.send({ data: aggregatedLines, error: null, statusCode: HTTP_STATUS.OK });
	}
}
