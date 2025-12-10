/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { annotations } from '@tmlmobilidade/interfaces';
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
		// Check if the user has permission to create annotations

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.create_annotations)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create annotations');
		}

		//
		// Create the new annotation

		const newAnnotation = await annotations.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newAnnotation, error: null, statusCode: HttpStatus.OK });

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
			throw new HttpException(HttpStatus.NOT_FOUND, 'Annotation not found');
		}

		//
		// Check if the user has permission to delete annotations

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.delete_annotations)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete annotations');
		}

		//

		await annotations.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all annotations.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Annotation[]>) {
		//

		//
		// Check if the user has permission to read annotations

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.read_annotations)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read annotations');
		}

		//
		// Fetch all annotations

		const allAnnotations = await annotations.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allAnnotations, error: null, statusCode: HttpStatus.OK });

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

		if (!annotationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Annotation not found');

		//
		// Check if the user has permission to read annotations

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.read_annotations)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read annotations');
		}

		//
		// Fetch the annotation data

		return reply.send({
			data: annotationData,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an annotation by ID
	 * @param request Fastify request containing annotation ID in params
	 * @param reply Fastify reply
	 */
	static async toggleLockById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
		//

		//
		// Get the Annotation from the database

		const annotationData = await annotations.findById(request.params.id);

		if (!annotationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Annotation not found');

		//
		// Check if the user has permission to toggle lock the Annotation

		const hasPermissionToggleLockAnnotation = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.dates.actions.toggle_lock_annotations,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.dates.scope,
			value: annotationData.agency_ids,
		});

		if (!hasPermissionToggleLockAnnotation) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: toggle lock annotation');

		//
		// Toggle the lock status of the annotation

		const result = await annotations.updateById(annotationData._id, { is_locked: !annotationData.is_locked });

		return reply.send({
			data: result,
			error: null,
			statusCode: HttpStatus.OK,
		});

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

		if (!annotationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Annotation not found');

		//
		// Check if the user has permission to update annotations

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.update_annotations)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update annotations');
		}

		//
		// Update the annotation

		const updatedAnnotation = await annotations.updateById(annotationData._id, request.body);

		//
		// Send the updated annotation data as the response

		reply.send({
			data: updatedAnnotation,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
	//
}
