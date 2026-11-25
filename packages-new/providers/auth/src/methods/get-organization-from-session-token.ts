/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';

import { getUserFromSessionToken } from './get-user-from-session-token.js';

/**
 * Get the organization for a user based on their session token.
 * @param sessionToken The session token to look up.
 * @returns The organization associated with the session token.
 */
export async function getOrganizationFromSessionToken(sessionToken: string): Promise<Organization | undefined> {
	//

	//
	// Get the user data from the database

	const userData = await getUserFromSessionToken(sessionToken);

	if (!userData) return undefined;

	//
	// Get the organization data from the database

	const organizationData = await goDb.core.organizations.findOne({ _id: { $eq: userData.organization_id } });

	if (!organizationData) return undefined;

	//
	// Return the organization data

	return organizationData;
}
