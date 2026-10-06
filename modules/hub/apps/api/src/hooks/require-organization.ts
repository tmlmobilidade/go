import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

export async function requireOrganization(request: FastifyRequest, reply: FastifyReply<unknown>) {
	const params = request.params;
	if (!params || typeof params !== 'object' || !('organizationId' in params) || typeof params.organizationId !== 'string') {
		return sendErrorApiResponse(reply, { error: 'Organization not found', status_code: '404' });
	}

	const organization = await goDb.core.organizations.findById(params.organizationId);
	if (!organization) {
		return sendErrorApiResponse(reply, { error: `Organization with ID ${params.organizationId} not found`, status_code: '404' });
	}
}
