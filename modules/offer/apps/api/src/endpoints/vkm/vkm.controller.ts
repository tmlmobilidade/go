/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CalculateVkmDto, CalculateVkmSchema, type VkmCalculationResult } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { calculateAgencyVkm } from '@tmlmobilidade/go-utils-offer';

/* * */

export class VkmController {
	/**
	 * Calculates vehicle-kilometres for an agency over a rolling year or fixed date range.
	 */
	static async calculate(request: FastifyRequest<{ Body: CalculateVkmDto }>, reply: FastifyReply<VkmCalculationResult>) {
		const parsed = CalculateVkmSchema.safeParse(request.body);

		if (!parsed.success) {
			return sendErrorApiResponse(reply, { error: parsed.error.message, status_code: '400' });
		}

		const payload = parsed.data;

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		if (!userLinePermissions) {
			return sendErrorApiResponse(reply, { error: 'You are not authorized to calculate VKM', status_code: '403' });
		}

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [payload.agency_id],
		});

		if (!hasPermissionForAgency) {
			return sendErrorApiResponse(reply, { error: 'You are not authorized to calculate VKM for this agency', status_code: '403' });
		}

		if (payload.calculation_method === 'fixed_range' && !payload.end_date) {
			return sendErrorApiResponse(reply, { error: 'End date is required for fixed range calculations', status_code: '400' });
		}

		const agency = await goDb.core.agencies.findById(payload.agency_id);

		if (!agency) {
			return sendErrorApiResponse(reply, { error: 'Agency not found', status_code: '404' });
		}

		const agencyLines = await goDb.offer.lines.findMany({ agency_id: payload.agency_id }, { projection: { _id: 1 } });
		const lineIds = agencyLines.map(line => line._id);

		const patternProjection = payload.extension_source === 'stop_times'
			? { 'line_id': 1, 'path.distance_delta': 1, 'rules': 1 }
			: { 'line_id': 1, 'rules': 1, 'shape.extension': 1 };

		const [agencyPatterns, agencyPeriods, agencyHolidays, agencyEvents] = await Promise.all([
			lineIds.length > 0
				? goDb.offer.patterns.findMany(
					{ line_id: { $in: lineIds } },
					{ projection: patternProjection },
				)
				: Promise.resolve([]),
			goDb.offer.yearPeriods.findMany(
				{ agency_ids: { $in: [payload.agency_id] } },
				{ projection: { _id: 1, code: 1, dates: 1, name: 1 } },
			),
			goDb.dates.holidays.findMany(
				{ agency_ids: { $in: [payload.agency_id] } },
				{ projection: { _id: 1, agency_ids: 1, dates: 1, title: 1 } },
			),
			goDb.offer.events.findMany(
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

		return sendSuccessApiResponse(reply, result);
	}
}
