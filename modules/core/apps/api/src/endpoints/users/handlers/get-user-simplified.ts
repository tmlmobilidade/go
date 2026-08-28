/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type SimplifiedUser } from '@tmlmobilidade/go-types-core';

/**
 * Returns a simplified User by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getUserSimplifiedHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedUser>) {
	// Find the user by ID
	const userData = await goDb.core.users.findById(request.params.id);
	if (!userData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
	}

	// Find the organization data associated with the user
	const organizationData = await goDb.core.organizations.findById(userData.organization_id);
	if (!organizationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
	}

	// Simplify the user data by selecting only specific fields
	const simplifiedUserData: SimplifiedUser = {
		_id: userData._id,
		first_name: userData.first_name,
		last_name: userData.last_name,
		organization_id: userData.organization_id,
		organization_name: organizationData.long_name,
		seen_last_at: userData.seen_last_at,
	};
		// Send the simplified user data in the response
	reply.send({ data: simplifiedUserData, error: null, statusCode: HTTP_STATUS.OK });
}
