/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME } from '@tmlmobilidade/go-providers-auth';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Streams the attachment file of an Extraction of the current user.
 * @param request The request object
 * @param reply The reply object
 */
export async function downloadExtractionHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
	//

	//
	// Extract the session token from authentication cookie

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	if (!sessionToken) {
		return sendErrorApiResponse(reply, {
			error: 'Session token not found',
			status_code: '401',
		});
	}

	//
	// Retrieve extraction for the current user

	const foundExtraction = await goDb.core.extractions.findOne({
		_id: request.params.id,
		created_by: request.me._id,
	});

	if (!foundExtraction) {
		return sendErrorApiResponse(reply, {
			error: 'Extraction not found or not owned by the current user',
			status_code: '404',
		});
	}

	//
	// Retrieve file data from database

	if (!foundExtraction.attachment_id) {
		return sendErrorApiResponse(reply, {
			error: 'Extraction has no attachment ID',
			status_code: '400',
		});
	}

	const foundAttachmentData = await storageProvider.findById(foundExtraction.attachment_id);

	if (!foundAttachmentData?.url) {
		return sendErrorApiResponse(reply, {
			error: 'Attachment not found for this extraction',
			status_code: '404',
		});
	}

	//
	// Stream the file in the given URL to the client

	const storageServiceResponse = await fetch(foundAttachmentData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch attachment file.',
			status_code: '500',
		});
	}

	//
	// Set headers and pipe the response body to the client

	reply.header('content-disposition', `attachment; filename="${foundAttachmentData.name}"`);
	reply.header('content-type', foundAttachmentData.type);
	reply.header('cache-control', 'no-store'); // Disable nginx and client caching
	reply.header('X-Accel-Buffering', 'no'); // Disable nginx buffering to memory

	//
	// Set content length if available

	const contentLength = storageServiceResponse.headers.get('content-length');

	if (contentLength) reply.header('content-length', contentLength);

	//
	// Pipe the response body to the client

	return reply.send(storageServiceResponse.body);
}
