/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { annotations, type Filter } from '@tmlmobilidade/interfaces';
import { type Annotation, type CreateAnnotationDto, PermissionCatalog, type UpdateAnnotationDto } from '@tmlmobilidade/types';

/* * */;

export class AnnotationsController {
	//

	/**
	 * Creates a new annotation.
	 * @param request Fastify request containing annotation data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateAnnotationDto }>, reply: FastifyReply<Annotation>) {
		//

		//
		// Get the resource permissions for annotations for the current user.

		const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.create);

		//
		// If no permission found, deny access

		if (!userAnnotationPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create annotations');
		}

		//
		// Validate that user has permission for ALL the specified agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.annotations.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.annotations.scope,
			value: request.body.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create annotations for these agencies. You must have permission for all agencies involved.');
		}

		//
		// Create the new annotation

		const newAnnotation = await annotations.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newAnnotation, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an annotation by ID
	 * @param request Fastify request containing annotation ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const annotation = await annotations.findById(id);

		if (!annotation) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
		}

		//
		// Get the resource permissions for annotations for the current user.

		const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.delete);

		//
		// If no permission found, deny access

		if (!userAnnotationPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete annotations');
		}

		//
		// Validate that user has permission for ALL of this annotation's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.annotations.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.annotations.scope,
			value: annotation.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this annotation. You must have permission for all agencies involved.');
		}

		//

		await annotations.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all annotations.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Annotation[]>) {
		//

		//
		// Get the resource permissions for annotations for the current user.

		const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.read);

		//
		// If no permission found, deny access

		if (!userAnnotationPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read annotations');
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<Annotation> = {};

		//
		// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
		// filter annotations by those agency IDs.

		if ('resources' in userAnnotationPermissions && 'agency_ids' in userAnnotationPermissions.resources) {
			if (!userAnnotationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_ids = { $in: userAnnotationPermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch annotations based on query filters

		const allAnnotations = await annotations.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allAnnotations, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves a single annotation by ID
	 * @param request Fastify request containing annotation ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
		//

		//
		// Get the Annotation from the database

		const annotationData = await annotations.findById(request.params.id);

		if (!annotationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
		}

		//
		// Get the resource permissions for annotations for the current user.

		const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.read);

		//
		// If no permission found, deny access

		if (!userAnnotationPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read annotations');
		}

		//
		// Validate that user has permission for at least one of this annotation's agencies

		const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.annotations.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.annotations.scope,
			value: annotationData.agency_ids,
		});

		if (!hasPermissionForAnyAgency) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this annotation');
		}

		//
		// Fetch the annotation data

		return reply.send({
			data: annotationData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an annotation by ID
	 * @param request Fastify request containing annotation ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
		//

		//
		// Get the Annotation from the database

		const annotationData = await annotations.findById(request.params.id);

		if (!annotationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
		}

		//
		// Get the resource permissions for annotations for the current user.

		const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.lock);

		//
		// If no permission found, deny access

		if (!userAnnotationPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock annotations');
		}

		//
		// Validate that user has permission for ALL of this annotation's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.annotations.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.annotations.scope,
			value: annotationData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock annotation. You must have permission for all agencies involved.');
		}

		// If authorized, toggle the lock status of the annotation
		await annotations.toggleLockById(request.params.id);
		const foundAnnotation = await annotations.findById(request.params.id);
		if (!foundAnnotation) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
		}
		return reply.send({ data: foundAnnotation, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing annotation by ID
	 * @param request Fastify request containing annotation ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAnnotationDto, Params: { id: string } }>, reply: FastifyReply<Annotation>) {
		//

		//
		// Get the Annotation from the database

		const annotationData = await annotations.findById(request.params.id);

		if (!annotationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
		}

		//
		// Get the resource permissions for annotations for the current user.

		const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.update);

		//
		// If no permission found, deny access

		if (!userAnnotationPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update annotations');
		}

		//
		// Validate that user has permission for ALL of this annotation's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.annotations.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.annotations.scope,
			value: annotationData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this annotation. You must have permission for all agencies involved.');
		}

		//
		// Update the annotation

		const updatedAnnotation = await annotations.updateById(annotationData._id, request.body);

		//
		// Send the updated annotation data as the response

		reply.send({
			data: updatedAnnotation,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
