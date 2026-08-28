import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Downloads a file export by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function downloadExport(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
	//

	//
	// Get the file export

	const fileExport = await goDb.core.exports.findById(request.params.id);

	if (!fileExport) {
		return sendErrorApiResponse(reply, {
			error: 'File export not found',
			status_code: '404',
		});
	}

	//
	// Get the stored file

	const fileData = await storageProvider.findById(fileExport.file_id);

	if (!fileData) {
		return sendErrorApiResponse(reply, {
			error: 'File not found',
			status_code: '404',
		});
	}

	//
	// Fetch the stored file

	const storageResponse = await fetch(fileData.url);

	if (!storageResponse.ok || !storageResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch file',
			status_code: '500',
		});
	}

	//
	// Set the download headers

	reply.header('Content-Disposition', `attachment; filename="${fileData.name}"`);
	reply.header('Content-Type', fileData.type);

	const contentLength = storageResponse.headers.get('Content-Length');
	if (contentLength) reply.header('Content-Length', contentLength);

	//
	// Stream the file to the client

	return reply.send(storageResponse.body);
}
