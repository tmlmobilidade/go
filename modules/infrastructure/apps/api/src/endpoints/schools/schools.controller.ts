/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { type SchoolsListFilters, SchoolsListFiltersSchema, type SchoolsListItem, SchoolsListItemSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateSchoolDto, CreateSchoolSchema, type School, type UpdateSchoolDto } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

export class SchoolsController {
	/* * */

	static async create(request: FastifyRequest<{ Body: CreateSchoolDto }>, reply: FastifyReply<School>) {
		const data = CreateSchoolSchema.parse(request.body);
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.schools.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: [data.agency_id],
		});

		if (!hasPermission) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create schools for this agency');
		}

		const result = await goDb.operation.schools.insertOne({
			...data,
			created_by: request.me._id,
			updated_by: request.me._id,
		});
		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/* * */

	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<School>) {
		const foundSchool = await goDb.operation.schools.findById(request.params.id);
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.schools.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: [foundSchool.agency_id],
		});

		if (!hasPermission) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this school');
		}

		await goDb.operation.schools.updateById(request.params.id, {
			is_deleted: !foundSchool.is_deleted,
			updated_by: request.me._id,
		});
		reply.send({ data: foundSchool, error: null, statusCode: HTTP_STATUS.OK });
	}

	/* * */

	static async getAll(request: FastifyRequest<{ Body: SchoolsListFilters }>, reply: FastifyReply<SchoolsListItem[]>) {
		const filters = SchoolsListFiltersSchema.parse(request.body ?? {});
		const userSchoolPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.schools.scope, PermissionCatalog.all.schools.actions.read);
		const queryFilters: Filter<School> = { is_deleted: false };

		if (userSchoolPermissions?.resources && !userSchoolPermissions.resources.agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_id = { $in: userSchoolPermissions.resources.agency_ids };
		}

		if (filters.search) {
			queryFilters.name = { $options: 'i', $regex: filters.search };
		}

		if (filters.municipality_ids?.length) {
			queryFilters.municipality_id = { $in: filters.municipality_ids };
		}

		if (filters.groupings?.length) {
			queryFilters.grouping = { $in: filters.groupings };
		}

		if (filters.cycles?.length) {
			queryFilters.$or = filters.cycles.map(cycle => ({ [cycle]: true }));
		}

		const data = await goDb.operation.schools.findMany(queryFilters, {
			projection: Object.fromEntries(Object.keys(SchoolsListItemSchema.shape).map(key => [key, 1])),
			sort: { created_at: -1 },
		});

		reply.send({ data: SchoolsListItemSchema.array().parse(data), error: null, statusCode: HTTP_STATUS.OK });
	}

	/* * */

	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<School>) {
		const foundSchool = await goDb.operation.schools.findById(request.params.id);
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, `Can not find school with ID ${request.params.id}`);
		}

		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.schools.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: [foundSchool.agency_id],
		});

		if (!hasPermission) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this school');
		}

		reply.send({ data: foundSchool, error: null, statusCode: HTTP_STATUS.OK });
	}

	/* * */

	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<School>) {
		const foundSchool = await goDb.operation.schools.findById(request.params.id);
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.schools.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: [foundSchool.agency_id],
		});

		if (!hasPermission) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock or unlock this school');
		}

		await goDb.operation.schools.toggleLockById(request.params.id);
		const updatedSchool = await goDb.operation.schools.findById(request.params.id);
		if (!updatedSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		reply.send({ data: updatedSchool, error: null, statusCode: HTTP_STATUS.OK });
	}

	/* * */

	static async update(request: FastifyRequest<{ Body: UpdateSchoolDto, Params: { id: string } }>, reply: FastifyReply<School>) {
		const foundSchool = await goDb.operation.schools.findById(request.params.id);
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.schools.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.schools.scope,
			value: [foundSchool.agency_id],
		});

		if (!hasPermission) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this school');
		}

		const data = await goDb.operation.schools.updateById(request.params.id, {
			...request.body,
			updated_by: request.me._id,
		});
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}
}
