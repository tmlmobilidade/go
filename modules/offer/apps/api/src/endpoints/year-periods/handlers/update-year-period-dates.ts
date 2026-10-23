/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { MongoDatabaseClient, withTransaction } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateYearPeriodDatesDto, UpdateYearPeriodDatesSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { applyYearPeriodDateChanges } from '../utils/apply-date-changes.js';
import { handleYearPeriodDateAssignment } from '../utils/handle-date-assignment.js';

/* * */

type DateUpdateResult = { data: YearPeriod, error?: never } | { data?: never, error: { error: string, status_code: '403' | '404' | '409' } };

/**
 * Applies explicit date changes and authorized conflict transfers atomically.
 * Read the target and conflicts in the same transaction to avoid stale updates.
 */
export async function updateYearPeriodDatesHandler(request: FastifyRequest<{ Body: UpdateYearPeriodDatesDto, Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
	//

	//
	// Validate changes before opening the transaction

	const changes = UpdateYearPeriodDatesSchema.safeParse(request.body);
	if (!changes.success) {
		return sendErrorApiResponse(reply, { error: changes.error.message, status_code: '400' });
	}

	const client = await MongoDatabaseClient.getClient({ prefix: 'GODB', tunnelType: 'GO' });
	const result = await withTransaction<DateUpdateResult>(client, async (session): Promise<DateUpdateResult> => {
		//
		// Authorize the current target within the transaction snapshot

		const period = await goDb.offer.yearPeriods.findById(request.params.id, { session });
		if (!period) return { error: { error: 'YearPeriod not found', status_code: '404' } };

		if (!PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.year_periods.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.year_periods.scope,
			value: period.agency_ids,
		})) {
			return { error: { error: 'You are not authorized to update this period.', status_code: '403' } };
		}
		if (period.is_locked) return { error: { error: 'YearPeriod is locked. Unlock it before making changes.', status_code: '409' } };

		//
		// Preflight all affected periods before transferring dates

		const dates = applyYearPeriodDateChanges(period.dates ?? [], changes.data.add_dates, changes.data.remove_dates);
		const assignment = await handleYearPeriodDateAssignment({
			actorId: request.me._id,
			agencyIds: period.agency_ids,
			newDates: changes.data.add_dates,
			session,
			userPermissions: request.permissions,
			yearPeriodId: period._id,
		});
		if (assignment.error) return { error: assignment.error };

		const data = await goDb.offer.yearPeriods.updateOne({ _id: period._id }, { dates, updated_by: request.me._id }, { session });
		return { data };
	});

	if (result.error) return sendErrorApiResponse(reply, result.error);
	return sendSuccessApiResponse(reply, result.data);
}
