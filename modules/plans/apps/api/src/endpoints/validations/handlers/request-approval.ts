/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { sendPlanApprovalRequestEmail } from '@tmlmobilidade/go-providers-emails';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';

/**
 * Requests approval for a Validation by ID
 * @param request Fastify request containing Validation ID in params
 * @param reply Fastify reply
 */
export async function requestApprovalHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested Validation data

	const validationData = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!validationData) {
		return sendErrorApiResponse(reply, {
			error: 'Validation not found',
			status_code: '404',
		});
	}

	//
	// Check if the notification has already been sent

	if (validationData.notification_sent) {
		return sendErrorApiResponse(reply, {
			error: 'Notification has already been sent',
			status_code: '400',
		});
	}

	//
	// Check if the user has permission to request approval for this Validation

	const hasPermissionRequestApproval = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.request_approval,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: validationData.agency_id,
	});

	if (!hasPermissionRequestApproval) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: request approval',
			status_code: '403',
		});
	}

	//
	// Get the TML contact emails for this Agency

	const agencyData = await goDb.core.agencies.findById(validationData.agency_id);

	if (!agencyData) {
		return sendErrorApiResponse(reply, {
			error: 'Agency not found',
			status_code: '404',
		});
	}

	//
	// Send the approval request email

	await sendPlanApprovalRequestEmail({
		data: {
			agencyName: agencyData.name,
			endDate: validateOperationalDate(validationData.gtfs_feed_info.feed_end_date),
			firstName: request.me.first_name,
			gtfsValidationId: validationData._id,
			gtfsValidationUrl: `${process.env.FRONTEND_URL}/validations/${validationData._id.toString()}`,
			requestedBy: request.me.first_name + ' ' + request.me.last_name,
			startDate: validateOperationalDate(validationData.gtfs_feed_info.feed_start_date),
		},
		to: agencyData.contact_emails_pta || [],
	});

	//
	// Update the Validation document and send it to caller

	const updatedValidation = await goDb.operation.gtfsValidations.updateById(validationData._id, { notification_sent: true });

	if (!updatedValidation) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to update Validation',
			status_code: '404',
		});
	}

	//
	// Return the updated Validation

	return sendSuccessApiResponse(reply, updatedValidation);

	//
}
