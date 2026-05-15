/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { fileExports, files, type Filter, stops } from '@tmlmobilidade/interfaces';
import { type CreateFileExportDto, type FileExport, PermissionCatalog, type Stop, type StopExportProperties } from '@tmlmobilidade/types';

/* * */

export class ExporterController {
	//
	private static getAllowedAgencyIdsForStopExport(request: FastifyRequest): null | string[] {
		const stopExportPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.export);
		if (!stopExportPermission || !('resources' in stopExportPermission) || !stopExportPermission.resources) return [];

		const agencyIds = stopExportPermission.resources['agency_ids'];
		if (!Array.isArray(agencyIds)) return [];
		if (agencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG)) return null;

		return agencyIds;
	}

	private static async validateStopExportPermissions(request: FastifyRequest<{ Body: CreateFileExportDto<{ properties: Record<string, unknown>, type: string }> }>) {
		if (request.body.type !== 'stop') return;

		const stopProperties = request.body.properties as Partial<StopExportProperties['properties']>;
		const allowedAgencyIds = ExporterController.getAllowedAgencyIdsForStopExport(request);
		if (allowedAgencyIds === null) return;

		const directFilters: Filter<Stop> = {};

		if (stopProperties.connections?.length) directFilters.connections = { $in: stopProperties.connections };
		if (stopProperties.equipment?.length) directFilters.equipment = { $in: stopProperties.equipment };
		if (stopProperties.facilities?.length) directFilters.facilities = { $in: stopProperties.facilities };
		if (stopProperties.flags?.length) directFilters.flags = { $in: stopProperties.flags };
		if (stopProperties.jurisdiction?.length) directFilters.jurisdiction = { $in: stopProperties.jurisdiction };
		if (stopProperties.lifecycle_statuses?.length) directFilters.lifecycle_status = { $in: stopProperties.lifecycle_statuses };

		const searchQuery = stopProperties.search?.trim();
		let searchFilter: Filter<Stop> | null = null;
		if (searchQuery) {
			const searchRegex = new RegExp(searchQuery, 'i');
			searchFilter = {
				$or: [
					{ _id: isNaN(Number(searchQuery)) ? -1 : Number(searchQuery) },
					{ legacy_id: searchRegex },
					{ legacy_ids: searchRegex },
					{ name: searchRegex },
					{ short_name: searchRegex },
					{ tts_name: searchRegex },
				],
			};
		}

		const andFilters = [directFilters, searchFilter].filter(Boolean) as Filter<Stop>[];
		const filters: Filter<Stop> = andFilters.length > 1 ? { $and: andFilters } : andFilters[0] ?? {};
		const stopsCollection = await stops.getCollection();
		const unauthorizedStop = await stopsCollection.findOne({
			$and: [
				filters,
				{ 'flags.agency_ids': { $exists: true, $not: { $size: 0 } } },
				{ 'flags.agency_ids': { $nin: allowedAgencyIds } },
			],
		}, { projection: { '_id': 1, 'flags.agency_ids': 1 } });

		if (unauthorizedStop) {
			const stopAgencyIds = [...new Set(unauthorizedStop.flags.flatMap(flag => flag.agency_ids))];
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You do not have permission to export stops for agency_ids: [' + stopAgencyIds.join(', ') + '].');
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
