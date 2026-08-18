/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { generateAlertDescription, type GenerateAlertDescriptionProps, type GenerateAlertDescriptionReturnType } from '@tmlmobilidade/go-alerts-pckg-describe';

/**
 * Generates a description for an alert.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function describeAlert(request: FastifyRequest<{ Body: GenerateAlertDescriptionProps }>, reply: FastifyReply<GenerateAlertDescriptionReturnType>) {
	const describeResult = await generateAlertDescription(request.body);
	reply.send({ data: describeResult, error: null, statusCode: HTTP_STATUS.OK });
}
