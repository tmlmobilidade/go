/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type CreateFileExportDto, type FileExport, type FileExportType } from '@tmlmobilidade/go-types-downloads';

/* * */

export class ExporterController {
	//
	/**
	 * Creates a file export.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateFileExportDto<{ properties: Record<string, unknown>, type: FileExportType }> }>, reply: FastifyReply<FileExport>) {
		const fileExportData = await goDb.core.exports.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
		return sendSuccessApiResponse(reply, fileExportData, { status_code: '201' });
	}

	/**
	 * Downloads a FileExport by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async download(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		const { id } = request.params;
		const fileExport = await goDb.core.exports.findById(id);
		if (!fileExport) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File export not found');
		}

		// Retrieve file data from database
		const foundFileData = await storageProvider.findById(fileExport.file_id);
		if (!foundFileData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		}
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
		}
		// Set headers and pipe the response body to the client
		reply.header('Content-Disposition', `attachment; filename="${foundFileData.name}"`);
		reply.header('Content-Type', foundFileData.type);
		// Set content length if available
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		// Pipe the response body to the client
		return reply.send(storageServiceResponse.body);
	}

	/**
	 * Returns the current user's file exports, newest first.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<FileExport[]>) {
		const filters = {
			created_by: request.me._id,
		};

		const fileExports = await goDb.core.exports.findMany(filters, { sort: { created_at: -1 } });
		return sendSuccessApiResponse(reply, fileExports);
	}

	//
}
