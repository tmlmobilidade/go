/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { sendPlanApprovalRequestEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { gtfsValidations } from '@tmlmobilidade/interfaces';
import { type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Requests approval for a Validation by ID
 * @param request Fastify request containing Validation ID in params
 * @param reply Fastify reply
 */
export async function requestApproval(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested Validation data

	const validationData = await gtfsValidations.findById(request.params.id);

	if (!validationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
	}

	//
	// Check if the notification has already been sent

	if (validationData.notification_sent) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Notification has already been sent');
	}

	//
	// Check if the user has permission to request approval for this Validation

	const hasPermissionRequestApproval = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.request_approval,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: validationData.gtfs_agency.agency_id,
	});

	if (!hasPermissionRequestApproval) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: request approval');
	}

	//
	// Get the TML contact emails for this Agency

	const agencyData = await goDb.core.agencies.findById(validationData.gtfs_agency.agency_id);

	if (!agencyData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
	}

	//
	// Send the approval request email

	await sendPlanApprovalRequestEmail({
		data: {
			agencyName: validationData.gtfs_agency.agency_name,
			endDate: validationData.gtfs_feed_info.feed_end_date,
			firstName: request.me.first_name,
			gtfsValidationId: validationData._id,
			gtfsValidationUrl: `${process.env.FRONTEND_URL}/validations/${validationData._id.toString()}`,
			requestedBy: request.me.first_name + ' ' + request.me.last_name,
			startDate: validationData.gtfs_feed_info.feed_start_date,
		},
		to: agencyData.contact_emails_pta || [],
	});

	//
	// Update the Validation document and send it to caller

	const updatedValidation = await gtfsValidations.updateById(validationData._id, { notification_sent: true });

	reply.send({ data: updatedValidation, error: null, statusCode: HTTP_STATUS.OK });

	//
}
