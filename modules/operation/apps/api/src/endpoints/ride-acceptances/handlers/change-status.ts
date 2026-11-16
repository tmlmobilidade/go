/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, RideAcceptanceStatusSchema, type UpdateRideAcceptanceDto } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Changes the status of a ride acceptance by ride ID
 */
export async function changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//
	const status = RideAcceptanceStatusSchema.safeParse(request.body?.acceptance_status);
	if (!status.success) {
		return sendErrorApiResponse(reply, { error: 'Invalid ride acceptance status.', status_code: '400' });
	}

	const oldRideAcceptanceData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldRideAcceptanceData) {
		return sendErrorApiResponse(reply, { error: 'Ride acceptance not found.', status_code: '404' });
	}

	const { actions, scope } = PermissionCatalog.all.rides;
	const canChangeStatus = PermissionCatalog.hasPermission(request.permissions, scope, actions.acceptance_change_status);
	if (!canChangeStatus) {
		const canJustify = PermissionCatalog.hasPermission(request.permissions, scope, actions.acceptance_justify);
		if (!canJustify || oldRideAcceptanceData.acceptance_status !== 'under_review' || status.data !== 'justification_required') {
			return sendErrorApiResponse(reply, { error: 'This ride acceptance status change is forbidden.', status_code: '403' });
		}

		const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
		const reopenedAcceptance = await rideAcceptances.findOneAndUpdate(
			{ _id: request.params.id, acceptance_status: 'under_review' },
			{ $set: { acceptance_status: status.data, updated_at: Dates.now('utc').unix_milliseconds, updated_by: request.me._id } },
			{ returnDocument: 'after' },
		);
		if (!reopenedAcceptance) {
			return sendErrorApiResponse(reply, { error: 'The ride acceptance status changed. Refresh and try again.', status_code: '409' });
		}
		return sendSuccessApiResponse(reply, reopenedAcceptance);
	}

	const updateResult = await goDb.operation.rideAcceptances.updateById(request.params.id, {
		acceptance_status: status.data,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updateResult);
}
