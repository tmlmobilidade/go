/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { composeAlertTitleAndDescription } from '@tmlmobilidade/go-alerts-pckg-compose';
import { type AlertsComposeRequest, type AlertsComposeResponse } from '@tmlmobilidade/go-alerts-pckg-types';

/**
 * Generates a description for an alert.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function composeAlert(request: FastifyRequest<{ Body: AlertsComposeRequest }>, reply: FastifyReply<AlertsComposeResponse>) {
	const result = await composeAlertTitleAndDescription(request.body);
	sendSuccessApiResponse(reply, result);
}
