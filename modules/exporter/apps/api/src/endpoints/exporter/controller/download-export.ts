import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File export not found');
	}

	//
	// Get the stored file

	const fileData = await storageProvider.findById(fileExport.file_id);

	if (!fileData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
	}

	//
	// Fetch the stored file

	const storageResponse = await fetch(fileData.url);

	if (!storageResponse.ok || !storageResponse.body) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
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
