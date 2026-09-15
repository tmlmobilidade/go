/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';
import { type MePreferencesPlatformRequest, MePreferencesPlatformRequestSchema, type User } from '@tmlmobilidade/go-types-core';

/**
 * Updates the preferences of the current user.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateMePreferencesHandler(request: FastifyRequest<{ Body: MePreferencesPlatformRequest }>, reply: FastifyReply<User>) {
	//

	//
	// Validate request body

	const validatedRequest = MePreferencesPlatformRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Get the user data from the session token

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	if (!sessionToken) {
		return sendErrorApiResponse(reply, { error: 'Session token not found', status_code: '401' });
	}

	const userData = await authProvider.getUserFromSessionToken(sessionToken);

	//
	// Merge current with updated preferences

	const currentPreferences = userData.preferences ?? {};
	const currentScope = currentPreferences[validatedRequest.data.scope] ?? {};
	const updatedScope = { ...currentScope, [validatedRequest.data.key]: validatedRequest.data.value };
	const updatedPreferences = { ...currentPreferences, [validatedRequest.data.scope]: updatedScope };

	//
	// Update the user preferences

	const updatedUser = await goDb.core.users.updateById(userData._id, { preferences: updatedPreferences });

	if (!updatedUser) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to update user',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, updatedUser);
}
