/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { describeAlert, type DescribeAlertProps, type DescribeAlertReturnType } from '@tmlmobilidade/go-alerts-pckg-compose';

/**
 * Describes an alert by ID.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function describe(request: FastifyRequest<{ Body: DescribeAlertProps }>, reply: FastifyReply<DescribeAlertReturnType>) {
	const describeResult = await describeAlert(request.body);

	reply.send({ data: describeResult, error: null, statusCode: HTTP_STATUS.OK });
}
