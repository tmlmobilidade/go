/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization, type UpdateOrganizationDto } from '@tmlmobilidade/go-types-core';

/**
 * Updates an Organization in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function updateOrganizationHandler(request: FastifyRequest<{ Body: UpdateOrganizationDto, Params: { id: string } }>, reply: FastifyReply<Organization>) {
	//

	const updatedOrganizationData = await goDb.core.organizations.updateById(request.params.id, {
		...request.body,
		updated_by: request.me._id,
	});

	reply.send({ data: updatedOrganizationData, error: null, statusCode: HTTP_STATUS.OK });
}
