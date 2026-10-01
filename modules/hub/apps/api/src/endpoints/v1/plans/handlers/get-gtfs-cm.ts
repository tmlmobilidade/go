/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Download the latest GTFS CM merged file.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsCmHandler(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	//
	// Retrieve the file data from the storage provider

	const foundFileData = await storageProvider.findById('gtfs-cm-latest');

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
	reply.header('content-disposition', 'attachment; filename="gtfs-cm-latest.zip"');
	reply.header('content-type', 'application/zip');
	reply.header('cache-control', 'no-store');
	reply.header('X-Accel-Buffering', 'no');

	const contentLength = storageServiceResponse.headers.get('content-length');
	if (contentLength) reply.header('content-length', contentLength);

	//
	// Pipe the response body to the client

	return reply.send(storageServiceResponse.body);
}
