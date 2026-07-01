/* * */

import { hasOfferCatalogReadAccess, type OfferCatalogScope } from '@/utils/catalog-permissions.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export function catalogReadPermissionMiddleware(catalogScope: OfferCatalogScope) {
	return async (request: FastifyRequest): Promise<void> => {
		const canRead = hasOfferCatalogReadAccess(request.permissions, catalogScope);

		if (!canRead) {
			throw new HttpException(
				HTTP_STATUS.FORBIDDEN,
				`Insufficient permissions | User: ${request.me._id} | Catalog: "${catalogScope}" | Requires lines read/update or ${catalogScope} nav`,
			);
		}
	};
}
