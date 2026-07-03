/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { calculateAgencyVkm } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { agencies, events, holidays, lines, patterns, yearPeriods } from '@tmlmobilidade/interfaces';
import { type CalculateVkmDto, CalculateVkmSchema, PermissionCatalog, type VkmCalculationResult } from '@tmlmobilidade/types';

/* * */

export class VkmController {
	/**
	 * Calculates vehicle-kilometres for an agency over a rolling year or fixed date range.
	 */
	static async calculate(request: FastifyRequest<{ Body: CalculateVkmDto }>, reply: FastifyReply<VkmCalculationResult>) {
		const parsed = CalculateVkmSchema.safeParse(request.body);

		if (!parsed.success) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, parsed.error.message);
		}

		const payload = parsed.data;

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		if (!userLinePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to calculate VKM');
		}

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [payload.agency_id],
		});

		if (!hasPermissionForAgency) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to calculate VKM for this agency');
		}

		if (payload.calculation_method === 'fixed_range' && !payload.end_date) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'End date is required for fixed range calculations');
		}

		const agency = await agencies.findById(payload.agency_id);

		if (!agency) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
		}

		const agencyLines = await lines.findMany({ agency_id: payload.agency_id }, { projection: { _id: 1 } });
		const lineIds = agencyLines.map(line => line._id);

		const patternProjection = payload.extension_source === 'stop_times'
			? { 'line_id': 1, 'path.distance_delta': 1, 'rules': 1 }
			: { 'line_id': 1, 'rules': 1, 'shape.extension': 1 };

		const [agencyPatterns, agencyPeriods, agencyHolidays, agencyEvents] = await Promise.all([
			lineIds.length > 0
				? patterns.findMany(
					{ line_id: { $in: lineIds } },
					{ projection: patternProjection },
				)
				: Promise.resolve([]),
			yearPeriods.findMany(
				{ agency_ids: { $in: [payload.agency_id] } },
				{ projection: { _id: 1, code: 1, dates: 1, name: 1 } },
			),
			holidays.findMany(
				{ agency_ids: { $in: [payload.agency_id] } },
				{ projection: { _id: 1, agency_ids: 1, dates: 1, title: 1 } },
			),
			events.findMany(
				{ agency_ids: { $in: [payload.agency_id] } },
				{ projection: { _id: 1, agency_ids: 1, dates: 1, rules: 1, title: 1 } },
			),
		]);

		const result = calculateAgencyVkm({
			agency,
			events: agencyEvents,
			holidays: agencyHolidays,
			patterns: agencyPatterns,
			periods: agencyPeriods,
			request: payload,
		});

		return reply.send({
			data: result,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}
}
