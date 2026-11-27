/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { renderAgencyValidationRulesReport } from '@tmlmobilidade/go-core-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Download a standalone HTML comparison of all agencies' validation rules.
 * @param request The request object
 * @param reply The reply object
 */
export async function downloadRulesReportHandler(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	//
	// A. Read the current agency configuration for the report

	const agencies = await goDb.core.agencies.findMany({}, {
		projection: { '_id': 1, 'plans.validation_rules': 1, 'short_name': 1 },
	});

	//
	// B. Check if there are any agencies

	if (!agencies.length) {
		return sendErrorApiResponse(reply, {
			error: 'No agencies found',
			status_code: '404',
		});
	}

	//
	// C. Return the HTML as an attachment, without caching the configuration snapshot

	reply.header('content-type', 'text/html; charset=utf-8');
	reply.header('content-disposition', 'attachment; filename="agency-validation-rules.html"');
	reply.header('cache-control', 'no-store');

	return reply.send(new Blob([renderAgencyValidationRulesReport(agencies)]).stream());
}
