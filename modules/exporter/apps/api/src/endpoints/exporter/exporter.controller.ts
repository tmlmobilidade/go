/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { fileExports, files, stops } from '@tmlmobilidade/interfaces';
import { type CreateFileExportDto, type FileExport, PermissionCatalog, type StopExportProperties } from '@tmlmobilidade/types';

/* * */

export class ExporterController {
	//
	private static getAllowedAgencyIdsForStopExport(request: FastifyRequest): null | string[] {
		const readAgencyIds = ExporterController.getStopActionAgencyIds(request, 'read');
		const exportAgencyIds = ExporterController.getStopActionAgencyIds(request, 'export');
		return ExporterController.intersectAgencyIds(readAgencyIds, exportAgencyIds);
	}

	private static getStopActionAgencyIds(request: FastifyRequest, action: 'export' | 'read'): null | string[] {
		const stopPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.stops.scope, action);
		if (!stopPermission || !('resources' in stopPermission) || !stopPermission.resources) return [];

		const agencyIds = stopPermission.resources['agency_ids'];
		if (!Array.isArray(agencyIds)) return [];
		if (agencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG)) return null;

		return agencyIds.map(String);
	}

	private static getStopIdsFromExportProperties(properties: Partial<StopExportProperties['properties']>): number[] {
		const stopIds = properties.stop_ids ?? [];
		return [...new Set(stopIds.map(Number).filter(id => !Number.isNaN(id)))];
	}

	private static intersectAgencyIds(first: null | string[], second: null | string[]): null | string[] {
		if (first === null) return second;
		if (second === null) return first;

		const secondSet = new Set(second);
		return first.filter(agencyId => secondSet.has(agencyId));
	}

	private static async validateStopExportPermissions(request: FastifyRequest<{ Body: CreateFileExportDto<{ properties: Record<string, unknown>, type: string }> }>) {
		if (request.body.type !== 'stop') return;

		const stopProperties = request.body.properties as Partial<StopExportProperties['properties']>;
		const stopIds = ExporterController.getStopIdsFromExportProperties(stopProperties);
		const allowedAgencyIds = ExporterController.getAllowedAgencyIdsForStopExport(request);
		if (allowedAgencyIds === null) return;
		if (!stopIds.length) return;

		const stopsCollection = await stops.getCollection();
		const stopsCursor = stopsCollection.find({ _id: { $in: stopIds } }, { batchSize: 1000, projection: { _id: 1, flags: 1 } });
		const allowedAgencyIdsSet = new Set(allowedAgencyIds.map(String));

		for await (const stop of stopsCursor) {
			const stopAgencyIds = [...new Set(stop.flags.flatMap(flag => flag.agency_ids).map(String))];
			if (!stopAgencyIds.length) continue;

			const hasPermission = stopAgencyIds.some(agencyId => allowedAgencyIdsSet.has(agencyId));
			if (!hasPermission) {
				throw new HttpException(HTTP_STATUS.FORBIDDEN, `You do not have permission to export stop ${stop._id}.`);
			}
		}
	}

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static async create(request: FastifyRequest<{ Body: CreateFileExportDto<any> }>, reply: FastifyReply<FileExport>) {
		await ExporterController.validateStopExportPermissions(request);
		const fileExportData = await fileExports.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
		return reply.send({ data: fileExportData, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Downloads a FileExport by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async download(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		const { id } = request.params;
		const fileExport = await fileExports.findById(id);
		if (!fileExport) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File export not found');

		// Retrieve file data from database
		const foundFileData = await files.findById(fileExport.file_id);
		if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) return reply.code(500).send('Could not fetch file.');
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
	 * Returns all FileExport sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<FileExport[]>) {
		const filters = {
			created_by: request.me._id,
		};

		const allFileExport = await fileExports.findMany(filters, { sort: { created_at: 1 } });
		return reply.send({ data: allFileExport, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
