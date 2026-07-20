/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { APP_BANNER_CONFIG_ID, type AppBanner } from '@tmlmobilidade/types';

/* * */

export async function getAppBanner(request: FastifyRequest, reply: FastifyReply<AppBanner | null>) {
	const appConfig = await goDb.core.appConfigs.findById(APP_BANNER_CONFIG_ID);
	reply.send({ data: appConfig ?? null, error: null, statusCode: HTTP_STATUS.OK });
}
