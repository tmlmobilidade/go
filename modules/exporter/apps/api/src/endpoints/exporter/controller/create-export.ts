import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateFileExportDto, type FileExport, type FileExportType } from '@tmlmobilidade/go-types-downloads';

/**
 * Creates a file export.
 * @param request The request object
 * @param reply The reply object
 */
export async function createExport(request: FastifyRequest<{ Body: CreateFileExportDto<{ properties: Record<string, unknown>, type: FileExportType }> }>, reply: FastifyReply<FileExport>) {
	//

	//
	// Create the file export

	const fileExport = await goDb.core.exports.insertOne({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	//
	// Return the file export

	return sendSuccessApiResponse(reply, fileExport, { status_code: '201' });
}
