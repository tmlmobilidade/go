import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';

/** Shape publication is not yet available. */
export async function getShapeHandler(request: FastifyRequest<{ Params: { id: string, organizationId: string } }>, reply: FastifyReply<never>) {
	//

	return sendErrorApiResponse(reply, { error: `Shape ${request.params.id} is unavailable`, status_code: '404' });
}
