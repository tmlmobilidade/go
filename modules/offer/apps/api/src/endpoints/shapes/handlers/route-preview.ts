/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { routeWithValhalla } from '@/utils/route-preview.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RoutePreviewResponse, RoutePreviewResponseSchema, type ShapesRoutePreviewRequest, ShapesRoutePreviewRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';

/* * */

const VALHALLA_URL = process.env.VALHALLA_URL ?? 'https://valhalla.go.tmlmobilidade.pt';

/** Calculates a route preview for an editable Pattern without persisting changes. */
export async function routePreviewHandler(request: FastifyRequest<{ Body: ShapesRoutePreviewRequest }>, reply: FastifyReply<RoutePreviewResponse>) {
	//
	// Validate coordinates and routing options before contacting the routing service.

	const validated = ShapesRoutePreviewRequestSchema.safeParse(request.body);
	if (!validated.success) {
		return sendErrorApiResponse(reply, { error: validated.error.message, status_code: '400' });
	}

	//
	// Enforce the same operator permissions and hierarchy locks as Pattern edits.

	const pattern = await goDb.offer.patterns.findById(validated.data.pattern_id);
	if (!pattern) return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	const access = await authorizePatternAccess({ action: 'update', pattern, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	//
	// Cancel upstream work when the requesting editor disconnects.

	const abortController = new AbortController();
	const abortRoute = () => abortController.abort();
	request.raw.once('aborted', abortRoute);
	reply.raw.once('close', abortRoute);

	try {
		const preview = await routeWithValhalla(validated.data.points, {
			costing: validated.data.costing,
			costing_options: validated.data.costing_options,
			signal: abortController.signal,
			url: VALHALLA_URL,
		});
		return sendSuccessApiResponse(reply, RoutePreviewResponseSchema.parse(preview));
	} catch (error) {
		abortController.abort();
		return sendErrorApiResponse(reply, { error: error instanceof Error ? error.message : 'Route preview failed', status_code: '502' });
	} finally {
		request.raw.off('aborted', abortRoute);
		reply.raw.off('close', abortRoute);
	}
}
