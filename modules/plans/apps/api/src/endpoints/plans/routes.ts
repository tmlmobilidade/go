/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { changeOperationFileHandler } from './handlers/change-operation-file.js';
import { controllerReprocessPlanHandler } from './handlers/controller-reprocess-plan.js';
import { createPlanHandler } from './handlers/create-plan.js';
import { deleteApexFileHandler } from './handlers/delete-apex-file.js';
import { deletePlanHandler } from './handlers/delete-plan.js';
import { downloadApexFileHandler } from './handlers/download-apex-file.js';
import { downloadOperationFileHandler } from './handlers/download-operation-file.js';
import { getApexFileHandler } from './handlers/get-apex-file.js';
import { getDrtModelHandler } from './handlers/get-drt-model.js';
import { getOperationFileHandler } from './handlers/get-operation-file.js';
import { getPlanHandler } from './handlers/get-plan.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listPlansHandler } from './handlers/list-plans.js';
import { lockPlanHandler } from './handlers/lock-plan.js';
import { sendApexNotificationHandler } from './handlers/send-apex-notification.js';
import { updateApexFileHandler } from './handlers/update-apex-file.js';
import { updatePlanHandler } from './handlers/update-plan.js';

/* * */

const NAMESPACE = '/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/list', { preHandler: authorizationMiddleware('plans', ['read']) }, listPlansHandler);

		instance.get('/list-agencies', { preHandler: authorizationMiddleware('plans', ['read']) }, listAgenciesHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware('plans', ['read']) }, getPlanHandler);

		instance.get('/:id/operation-file', { preHandler: authorizationMiddleware('plans', ['read']) }, getOperationFileHandler);

		instance.get('/:id/apex-file', { preHandler: authorizationMiddleware('plans', ['read_apex_file']) }, getApexFileHandler);

		instance.get('/:id/operation-file/download', { preHandler: authorizationMiddleware('plans', ['read']) }, downloadOperationFileHandler);

		instance.get('/:id/apex-file/download', { preHandler: authorizationMiddleware('plans', ['read_apex_file']) }, downloadApexFileHandler);

		instance.post('/:id/apex-file', { preHandler: authorizationMiddleware('plans', ['update_apex_file']) }, updateApexFileHandler);

		instance.delete('/:id/apex-file', { preHandler: authorizationMiddleware('plans', ['delete_apex_file']) }, deleteApexFileHandler);

		instance.get('/:id/apex-file/send-notification', { preHandler: authorizationMiddleware('plans', ['send_apex_notification']) }, sendApexNotificationHandler);

		instance.post('/create', { preHandler: authorizationMiddleware('plans', ['create']) }, createPlanHandler);

		instance.put('/:id', { preHandler: authorizationMiddleware('plans', ['update']) }, updatePlanHandler);

		instance.get('/:id/lock', { preHandler: authorizationMiddleware('plans', ['lock']) }, lockPlanHandler);

		instance.get('/:id/controller-reprocess', { preHandler: authorizationMiddleware('plans', ['update_controller']) }, controllerReprocessPlanHandler);

		instance.delete('/:id', { preHandler: authorizationMiddleware('plans', ['delete']) }, deletePlanHandler);

		instance.post('/:id/change-gtfs', { preHandler: authorizationMiddleware('plans', ['update_gtfs_plan']) }, changeOperationFileHandler);

		instance.get('/drt-model/:id', getDrtModelHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
