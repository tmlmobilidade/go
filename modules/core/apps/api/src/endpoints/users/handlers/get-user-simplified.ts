/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type SimplifiedUser } from '@tmlmobilidade/go-types-core';

/**
 * Returns a simplified User by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getUserSimplifiedHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedUser>) {
	//

	//
	// Get the user data

	const foundUser = await goDb.core.users.findById(request.params.id);

	if (!foundUser) {
		return sendErrorApiResponse(reply, {
			error: `User with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Get the organization data associated with the user

	const foundOrganization = await goDb.core.organizations.findById(foundUser.organization_id);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: `Organization with ID ${foundUser.organization_id} not found`,
			status_code: '404',
		});
	}

	//
	// Simplify the user data by selecting only specific fields

	const simplifiedUserData: SimplifiedUser = {
		_id: foundUser._id,
		first_name: foundUser.first_name,
		last_name: foundUser.last_name,
		organization_id: foundUser.organization_id,
		organization_name: foundOrganization.long_name,
		seen_last_at: foundUser.seen_last_at,
	};

	return sendSuccessApiResponse(reply, simplifiedUserData);
}
