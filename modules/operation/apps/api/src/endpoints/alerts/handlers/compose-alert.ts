/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { composeAlertTitleAndDescription } from '@tmlmobilidade/go-operation-pckg-compose-alert';
import { type AlertsComposeRequest, type AlertsComposeResponse } from '@tmlmobilidade/go-operation-pckg-types';

/**
 * Generates a description for an alert.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function composeAlertHandler(request: FastifyRequest<{ Body: AlertsComposeRequest }>, reply: FastifyReply<AlertsComposeResponse>) {
	const result = await composeAlertTitleAndDescription(request.body);
	sendSuccessApiResponse(reply, result);
}
