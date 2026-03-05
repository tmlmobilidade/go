import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { hashedTrips, lines, rides } from '@tmlmobilidade/interfaces';
import { type Line, PermissionCatalog } from '@tmlmobilidade/types';

export interface LineByHashedTrip {
	hashed_trip_ids: string[]
	line_id: number
	line_long_name: string
	line_short_name: string
}

interface GetLinesByHashedTripQuery {
	agency_id?: string
	date_end?: number | string
	date_start?: number | string
	hashed_trip_ids?: string | string[]
}

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

	/**
	 * Get all lines ids with all hashed_trips used in rides.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getAllLinesIdsByHashedTrip(request: FastifyRequest<{ Querystring: GetLinesByHashedTripQuery }>, reply: FastifyReply<LineByHashedTrip[]>) {
		//
		// Resolve hashed trip ids from query directly or by rides filters (date/agency).

		const parsedDateStart = Number(request.query.date_start);
		const parsedDateEnd = Number(request.query.date_end);
		const hasDateRangeFilters = Number.isFinite(parsedDateStart) && Number.isFinite(parsedDateEnd);

		const hashedTripIdsQuery = request.query.hashed_trip_ids
			? (Array.isArray(request.query.hashed_trip_ids) ? request.query.hashed_trip_ids : [request.query.hashed_trip_ids])
			: [];

		const hasHashedTripIds = hashedTripIdsQuery.length > 0;

		let aggregatedRides: Array<{ _id: string }> = [];

		if (hasHashedTripIds) {
			aggregatedRides = await rides.aggregate([
				{ $match: { hashed_trip_id: { $in: hashedTripIdsQuery.filter(Boolean) } } },
				{ $group: { _id: '$hashed_trip_id' } },
			]) as Array<{ _id: string }>;
		} else if (hasDateRangeFilters) {
			const ridesMatchStage: Record<string, unknown> = {
				start_time_scheduled: { $gte: parsedDateStart, $lte: parsedDateEnd },
			};

			if (request.query.agency_id) {
				ridesMatchStage.agency_id = request.query.agency_id;
			}

			aggregatedRides = await rides.aggregate([
				{ $match: ridesMatchStage },
				{ $group: { _id: '$hashed_trip_id' } },
			]) as Array<{ _id: string }>;
		} else {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const uniqueHashedTripIds = aggregatedRides
			.map(ride => ride._id)
			.filter(Boolean);
		if (!uniqueHashedTripIds.length) {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		//
		// Aggregate hashed trips by line_id and keep only one hashed_trip_id per line.

		const aggregatedLines = await hashedTrips.aggregate([
			{ $match: { _id: { $in: uniqueHashedTripIds } } },
			{ $sort: { _id: 1 } },
			{
				$group: {
					_id: '$line_id',
					hashed_trip_id: { $first: '$_id' },
					line_long_name: { $first: '$line_long_name' },
					line_short_name: { $first: '$line_short_name' },
				},
			},
		]) as unknown as Array<{
			_id: number
			hashed_trip_id: string
			line_long_name: string
			line_short_name: string
		}>;

		const linesByHashedTrip = aggregatedLines.map(item => ({
			hashed_trip_ids: [item.hashed_trip_id],
			line_id: item._id,
			line_long_name: item.line_long_name,
			line_short_name: item.line_short_name,
		}));

		return reply.send({ data: linesByHashedTrip, error: null, statusCode: HTTP_STATUS.OK });
	}
}
