/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { getOrganizationGtfsResourceId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Download the latest GTFS feed for an enabled organization.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsHandler(request: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply<string>) {
	//

	//
	// Retrieve the file data from the storage provider

	const organization = await goDb.core.organizations.findById(request.params.organizationId);

	if (!organization?.open_data?.gtfs?.enabled) {
		return sendErrorApiResponse(reply, {
			error: 'Organization with GTFS publishing enabled not found',
			status_code: '404',
		});
	}

	const resourceId = getOrganizationGtfsResourceId(organization._id);
	const foundFileData = await storageProvider.findById(resourceId);

	if (!foundFileData?.url) {
		return sendErrorApiResponse(reply, {
			error: 'File not found',
			status_code: '404',
		});
	}

	//
	// Fetch the file from the storage service URL

	const storageServiceResponse = await fetch(foundFileData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch file.',
			status_code: '500',
		});
	}

	//
	// Set the download headers, disabling nginx and client caching
	// and nginx buffering to memory

	reply.header('access-control-allow-origin', '*');
	reply.header('content-disposition', `attachment; filename="${encodeURIComponent(resourceId)}.zip"`);
	reply.header('content-type', 'application/zip');
	reply.header('cache-control', 'no-store');
	reply.header('X-Accel-Buffering', 'no');

	const contentLength = storageServiceResponse.headers.get('content-length');
	if (contentLength) reply.header('content-length', contentLength);

	//
	// Pipe the response body to the client

	return reply.send(storageServiceResponse.body);
}
