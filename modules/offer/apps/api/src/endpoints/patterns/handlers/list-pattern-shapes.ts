/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsShapeMapItem, type PatternsShapeMapQuery, PatternsShapeMapQuerySchema } from '@tmlmobilidade/go-offer-pckg-types';
import { filterPermissionResourceValues, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves compact pattern shape data for one agency.
 */
export async function listPatternShapesHandler(request: FastifyRequest<{ Querystring: PatternsShapeMapQuery }>, reply: FastifyReply<PatternsShapeMapItem[]>) {
	//
	// Validate the query before narrowing it to permitted operators.

	const validatedQuery = PatternsShapeMapQuerySchema.safeParse(request.query);
	if (!validatedQuery.success) {
		return sendErrorApiResponse(reply, { error: validatedQuery.error.message, status_code: '400' });
	}
	const requestedAgencyIds = [...new Set((validatedQuery.data.agency_ids ?? '').split(',').map(id => id.trim()).filter(Boolean))];
	if (!requestedAgencyIds.length) {
		return sendErrorApiResponse(reply, { error: 'agency_ids is required', status_code: '400' });
	}

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read patterns', status_code: '403' });
	}

	const agencyIds = filterPermissionResourceValues({
		action: PermissionCatalog.all.lines.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		values: requestedAgencyIds,
	});
	if (!agencyIds.length) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read patterns for these agencies', status_code: '403' });
	}

	const agencyLines = await goDb.offer.lines.findMany(
		{ agency_id: { $in: agencyIds } },
		{ projection: { _id: 1, agency_id: 1, code: 1, name: 1, typology: 1 }, sort: { code: 1 } },
	);

	const lineIds = agencyLines.map(line => line._id);
	if (!lineIds.length) return sendSuccessApiResponse(reply, []);

	const agencyTypologies = await goDb.offer.typologies.findMany({ agency_ids: { $in: agencyIds } });
	const typologyColorById = new Map(agencyTypologies.map(typology => [typology._id, typology.color]));
	const typologyTextColorById = new Map(agencyTypologies.map(typology => [typology._id, typology.text_color]));
	const lineById = new Map(agencyLines.map(line => [line._id, line]));

	const agencyPatterns = await goDb.offer.patterns.findMany(
		{
			'line_id': { $in: lineIds },
			'shape.encoded_polyline': { $exists: true },
		},
		{
			projection: {
				'_id': 1,
				'code': 1,
				'destination': 1,
				'headsign': 1,
				'line_id': 1,
				'origin': 1,
				'route_id': 1,
				'shape.encoded_polyline': 1,
			},
			sort: { code: 1 },
		},
	);

	const result = agencyPatterns.flatMap((pattern): PatternsShapeMapItem[] => {
		const line = lineById.get(pattern.line_id);
		const encodedPolyline = pattern.shape?.encoded_polyline;
		if (!line || !encodedPolyline) return [];

		return [{
			agency_id: line.agency_id,
			color: line.typology ? typologyColorById.get(line.typology) ?? '#1c7ed6' : '#1c7ed6',
			destination: pattern.destination,
			encoded_polyline: encodedPolyline,
			headsign: pattern.headsign,
			line_code: line.code,
			line_id: line._id,
			line_name: line.name,
			line_text_color: line.typology ? typologyTextColorById.get(line.typology) ?? '#ffffff' : '#ffffff',
			origin: pattern.origin,
			pattern_code: pattern.code,
			pattern_id: pattern._id,
			route_id: pattern.route_id,
		}];
	});

	return sendSuccessApiResponse(reply, result);
}
