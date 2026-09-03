/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { sendNewApexFileNotificationEmail } from '@tmlmobilidade/go-providers-emails';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';

/**
 * Sends a notification to the APEX contact emails.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function sendApexNotificationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<undefined>) {
	//

	//
	// Get the Plan from the database

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	if (!foundPlan) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to send the APEX notification

	const hasPermissionSendApexNotification = hasPermissionResource(request.permissions, {
		requiredPermission: { action: 'send_apex_notification', scope: 'plans' },
		requiredValue: foundPlan.agency_id,
		resourceKey: 'agency_ids',
	});

	if (!hasPermissionSendApexNotification) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to send the APEX notification.',
			status_code: '403',
		});
	}

	//
	// Fetch the Agency data

	const agencyData = await goDb.core.agencies.findById(foundPlan.agency_id);

	if (!agencyData.plans.apex_notification_emails.length) {
		return sendErrorApiResponse(reply, {
			error: 'No APEX contact emails found for this agency.',
			status_code: '400',
		});
	}

	//
	// Fetch the APEX file data

	const foundFileData = await storageProvider.findById(foundPlan.apex_file_id);

	if (!foundFileData) {
		return sendErrorApiResponse(reply, {
			error: 'APEX file not found for this plan',
			status_code: '404',
		});
	}

	const storageServiceResponse = await fetch(foundFileData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch file',
			status_code: '500',
		});
	}

	const apexFileBuffer = Buffer.from(await storageServiceResponse.arrayBuffer());

	//
	// Send the APEX notification

	await sendNewApexFileNotificationEmail({
		attachments: [{
			content: apexFileBuffer,
			contentType: 'application/xml',
			filename: foundFileData.name,
		}],
		data: {
			agencyName: agencyData.name,
			planId: foundPlan._id,
			startDate: foundPlan.active_from,
		},
		to: agencyData.plans.apex_notification_emails ?? [],
	});

	//
	// Return the updated Plan

	return sendSuccessApiResponse(reply, undefined);
}
