/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Gets organization logo from the database.
 * @param request The request object containing the organization ID in the params.
 * @param reply The reply object used to send the response.
 */
export async function getImageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ logo_dark?: string, logo_light?: string }>) {
	// Find the organization by ID
	const organization = await goDb.core.organizations.findById(request.params.id);
	if (!organization) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
	}
	// Fetch logo files if they exist
	const logoDark = await storageProvider.findById(organization.logo_dark);
	const logoLight = await storageProvider.findById(organization.logo_light);
	// Send the response with logo URLs
	reply.send({ data: { logo_dark: logoDark?.url ?? null, logo_light: logoLight?.url ?? null }, error: null, statusCode: HTTP_STATUS.OK });
}
