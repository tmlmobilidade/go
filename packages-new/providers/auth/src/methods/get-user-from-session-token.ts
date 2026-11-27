/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type User } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { hashAuthToken } from '../utils/hash-auth-token.js';

/**
 * Get a user object from their session token.
 * @param sessionToken The session token to look up.
 * @returns The user associated with the session token.
 * @throws An error if user or session not found.
 */
export async function getUserFromSessionToken(sessionToken: string): Promise<User> {
	//

	//
	// Get the session data

	const sessionData = await goDb.core.sessions.findOne({
		expires_at: { $gt: Dates.now('utc').unix_milliseconds },
		token: { $eq: hashAuthToken(sessionToken) },
	});

	if (!sessionData) throw new Error('Session not found');

	//
	// Update the seen_last_at field to the current timestamp

	const updatedUserData = await goDb.core.users.updateOne(
		{ _id: sessionData.user_id },
		{ seen_last_at: Dates.now('utc').unix_milliseconds },
	);

	if (!updatedUserData) throw new Error('User not found');

	//
	// Remove the password hash from the returned user data

	updatedUserData.password_hash = null;

	//
	// Return the user data

	return updatedUserData;
}
