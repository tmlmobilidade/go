/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Line } from '@tmlmobilidade/go-types-offer';

/* * */

/**
 * Retrieves the lines available to the Plans poster export flow.
 * Access is controlled by the generate_pdf_posters route permission.
 */
export async function getPosterLines(_request: FastifyRequest, reply: FastifyReply<Line[]>) {
	const lines = await goDb.offer.lines.findMany({}, { sort: { code: 1 } });

	return reply.send({ data: lines, error: null, statusCode: HTTP_STATUS.OK });
}
