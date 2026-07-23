/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { sendNewApexFileNotificationEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Sends a notification to the APEX contact emails.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function sendApexNotification(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<undefined>) {
	//

	//
	// Get the Plan from the database

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	if (!foundPlan) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Check if the user has permission to send the APEX notification

	const hasPermissionSendApexNotification = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.send_apex_notification,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.agency_id,
	});

	if (!hasPermissionSendApexNotification) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to send the APEX notification.');

	//
	// Fetch the Agency data

	const agencyData = await goDb.core.agencies.findById(foundPlan.agency_id);

	if (!agencyData.apex.contact_emails.length) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No APEX contact emails found for this agency.');

	//
	// Fetch the APEX file data

	const foundFileData = await storageProvider.findById(foundPlan.apex_file_id);

	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'APEX file not found for this plan');

	const storageServiceResponse = await fetch(foundFileData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
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
			startDate: foundPlan.gtfs_feed_info.feed_start_date,
		},
		to: agencyData.apex.contact_emails ?? [],
	});

	//
	// Return the updated Plan

	reply.send({
		data: undefined,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
