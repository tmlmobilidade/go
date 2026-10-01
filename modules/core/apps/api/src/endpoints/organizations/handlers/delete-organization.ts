/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Deletes an Organization from the database.
 * @param request The request object containing the organization ID in the params.
 * @param reply The reply object used to send the response.
 */
export async function deleteOrganizationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	// Find the organization by ID
	const organization = await goDb.core.organizations.findById(request.params.id);
	if (!organization) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
	}
	// Delete associated logo files if they exist
	if (organization.logo_dark) {
		try {
			await storageProvider.delete(organization.logo_dark);
		} catch (error) {
			throw new error();
		}
	}
	if (organization.logo_light) {
		try {
			await storageProvider.delete(organization.logo_light);
		} catch (error) {
			throw new error();
		}
	}
	// Delete the organization from the database
	await goDb.core.organizations.deleteById(request.params.id);
	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
