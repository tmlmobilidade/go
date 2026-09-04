/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Download the latest GTFS CM merged file.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsCm(request: FastifyRequest, reply: FastifyReply<unknown>) {
	// Retrieve file data from database
	const foundFileData = await storageProvider.findById('gtfs-cm-latest');
	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
	// Stream the file in the given URL to the client
	const storageServiceResponse = await fetch(foundFileData.url);
	if (!storageServiceResponse.ok || !storageServiceResponse.body) return reply.code(500).send('Could not fetch file.');
	// Set headers and pipe the response body to the client
	reply.header('access-control-allow-origin', '*');
	reply.header('content-disposition', `attachment; filename="gtfs-cm-latest.zip"`);
	reply.header('content-type', 'application/zip');
	reply.header('cache-control', 'no-store'); // Disable nginx and client caching
	reply.header('X-Accel-Buffering', 'no'); // Disable nginx buffering to memory
	// Set content length if available
	const contentLength = storageServiceResponse.headers.get('content-length');
	if (contentLength) reply.header('content-length', contentLength);
	// Pipe the response body to the client
	return reply.send(storageServiceResponse.body);
}
