/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { CreateSchoolSchema, PermissionCatalog, type School, type SchoolId, type UpdateSchoolDto } from '@tmlmobilidade/types';

/**
 * This is an example controller that is using the schools interface.
 */

export class SchoolsController {
	//

	/**
	 * Creates a new School
	 * @param request Fastify request containing stop data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<School>) {
		//
		// Parse the request body
		const data = CreateSchoolSchema.parse(request.body);

		// //
		// // Check if the user has permission to run this action
		// const hasPermission = PermissionCatalog.hasPermissionResource({
		// 	action: PermissionCatalog.all.stops.actions.create,
		// 	permissions: request.permissions,
		// 	resource_key: 'agency_ids',
		// 	scope: PermissionCatalog.all.stops.scope,
		// 	value: data.flags.flatMap(flag => flag.agency_ids),
		// });

		const result = await goDb.infrastructure.schools.insertOne({ ...data, _id: newSchoolId }, { unsafe: true });

		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Toggles the deleted status of a school by ID.
	 * @param request Fastify request containing stop ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: SchoolId } }>, reply: FastifyReply<School>) {
		//
		// Get the school from the database
		const foundSchool = await goDb.infrastructure.schools.findById(Number(request.params.id));
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		if (foundSchool.flags.length !== 0) {
		// If authorized, toggle the deleted status of the school
		await goDb.infrastructure.schools.updateOne({ _id: request.params.id }, { is_deleted: !foundSchool.is_deleted });

		reply.send({ data: foundSchool, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all schools, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<School[]>) {
		//

		// Get the resource permissions for schools for the current user.
		// The schools will be filtered by the agency_ids in the resources.
		const userSchoolPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.schools.scope, PermissionCatalog.all.schools.actions.read);

		const queryFilters: Filter<School> = {};
		const data = await goDb.infrastructure.schools.findMany(queryFilters, {
			projection: { _id: 1, is_deleted: 1, name: 1 },
			sort: { created_at: -1 },
		});
		if (!data) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Can not get schools from database');
		}
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Generates and retrieves a new unique School ID
	 * that does not conflict with existing IDs or deleted CM Schools.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getValidId(request: FastifyRequest, reply: FastifyReply<SchoolId>) {
		if (!newSchoolId) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Can not generate a new school ID');
		}

		reply.send({ data: newSchoolId, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single school by ID.
	 * @param request Fastify request containing school ID in params.
	 * @param reply Fastify reply.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: SchoolId } }>, reply: FastifyReply<School>) {
		// Get the stop from the database
		const foundSchool = await goDb.infrastructure.schools.findById(Number(request.params.id));
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, `Can not find school with ID ${request.params.id}`);
		}

		if (foundSchool.flags.length !== 0) {
			// Check if the user has permission to run this action
			const hasPermission = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.schools.actions.read,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: foundSchool.flags.flatMap(flag => flag.agency_ids),
			});

			if (!hasPermission) {
				throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this school');
			}
		}

		//

		reply.send({ data: foundSchool, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of a school by ID.
	 * @param request Fastify request containing school ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: SchoolId } }>, reply: FastifyReply<School>) {
		// Get the stop from the database
		const foundSchool = await goDb.infrastructure.schools.findById(Number(request.params.id));
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		if (foundSchool.flags.length !== 0) {
			// Check if the user has permission to run this action
			const hasPermission = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.schools.actions.lock,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.schools.scope,
				value: foundSchool.flags.flatMap(flag => flag.agency_ids),
			});

			if (!hasPermission) {
				throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock or unlock this school');
			}
		}

		// If authorized, toggle the lock status of the school
		await goDb.infrastructure.schools.toggleLockById(foundSchool._id);

		reply.send({ data: foundSchool, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing school by ID
	 * @param request Fastify request containing school ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateSchoolDto, Params: { id: SchoolId } }>, reply: FastifyReply<School>) {
		// Get the stop from the database
		const foundSchool = await goDb.infrastructure.schools.findById(Number(request.params.id));
		if (!foundSchool) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'School not found');
		}

		// Check if the user has permission to run this action
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.schools.actions.update,
			permissions: request.permissions,
			scope: PermissionCatalog.all.schools.scope,
		});
		// Perform the update
		const data = await goDb.infrastructure.schools.updateById(Number(request.params.id), request.body);
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}
}
