/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type SidebarLogoPlatformRequest, SidebarLogoPlatformRequestSchema, type SidebarLogoPlatformResponse } from '@tmlmobilidade/go-types-core';

/**
 * Returns the sidebar logo URL of the current user's organization for the given theme mode.
 * @param request The request object
 * @param reply The reply object
 */
export async function getSidebarLogoHandler(request: FastifyRequest<{ Body: SidebarLogoPlatformRequest }>, reply: FastifyReply<SidebarLogoPlatformResponse>) {
	//

	//
	// Check if the current user has an organization ID

	if (!request.me?.organization_id) {
		return sendErrorApiResponse(reply, {
			error: 'Organization not found in user session.',
			status_code: '400',
		});
	}

	//
	// Get the corresponding organization data

	const foundOrganization = await goDb.core.organizations.findById(request.me.organization_id);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: 'Organization not found.',
			status_code: '404',
		});
	}

	//
	// Validate the request parameters and get the corresponding file URL

	const validatedParams = SidebarLogoPlatformRequestSchema.safeParse(request.body);

	if (!validatedParams.success) {
		return sendErrorApiResponse(reply, {
			error: validatedParams.error.message,
			status_code: '400',
		});
	}

	const fileId = validatedParams.data.theme_mode === 'light'
		? foundOrganization.logo_light
		: foundOrganization.logo_dark;

	if (!fileId) {
		return sendErrorApiResponse(reply, {
			error: 'Sidebar logo not found.',
			status_code: '404',
		});
	}

	const fileData = await storageProvider.findById(fileId);

	if (!fileData) {
		return sendErrorApiResponse(reply, {
			error: 'Sidebar logo not found.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, fileData.url);
}
