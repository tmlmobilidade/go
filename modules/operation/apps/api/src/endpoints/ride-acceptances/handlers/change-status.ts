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
	const isReopening = oldRideAcceptanceData.acceptance_status === 'under_review' && status.data === 'justification_required';
	const canReopen = isReopening && PermissionCatalog.hasPermission(request.permissions, scope, actions.acceptance_justify);
	if (!canChangeStatus && !canReopen) {
		return sendErrorApiResponse(reply, { error: 'This ride acceptance status change is forbidden.', status_code: '403' });
	}

	const previousStatus = oldRideAcceptanceData.acceptance_status;
	if (previousStatus === status.data) {
		return sendSuccessApiResponse(reply, oldRideAcceptanceData);
	}

	const now = Dates.now('utc').unix_milliseconds;
	const userId = request.me._id;
	const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
	const updateResult = await rideAcceptances.findOneAndUpdate(
		{ _id: request.params.id, acceptance_status: previousStatus },
		{
			$push: { comments: {
				created_at: now,
				created_by: userId,
				curr_value: status.data,
				field: 'acceptance_status',
				prev_value: previousStatus,
				type: 'field_changed',
				updated_at: now,
				updated_by: userId,
			} },
			$set: { acceptance_status: status.data, updated_at: now, updated_by: userId },
		},
		{ returnDocument: 'after' },
	);

	if (!updateResult) {
		return sendErrorApiResponse(reply, { error: 'The ride acceptance status changed. Refresh and try again.', status_code: '409' });
	}

	return sendSuccessApiResponse(reply, updateResult);
}
