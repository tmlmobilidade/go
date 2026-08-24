/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { changeOperationFile } from './controllers/change-operation-file.js';
import { controllerReprocessPlan } from './controllers/controller-reprocess-plan.js';
import { createPlan } from './controllers/create-plan.js';
import { deleteApexFile } from './controllers/delete-apex-file.js';
import { deletePlan } from './controllers/delete-plan.js';
import { downloadApexFile } from './controllers/download-apex-file.js';
import { downloadOperationFile } from './controllers/download-operation-file.js';
import { getAllPlans } from './controllers/get-all-plans.js';
import { getApexFile } from './controllers/get-apex-file.js';
import { getDrtModel } from './controllers/get-drt-model.js';
import { getOperationFile } from './controllers/get-operation-file.js';
import { getPlan } from './controllers/get-plan.js';
import { lockPlan } from './controllers/lock-plan.js';
import { sendApexNotification } from './controllers/send-apex-notification.js';
import { updateApexFile } from './controllers/update-apex-file.js';
import { updatePlan } from './controllers/update-plan.js';

/* * */

const NAMESPACE = '/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware('plans', ['read']) },
			getAllPlans,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware('plans', ['read']) },
			getPlan,
		);

		instance.get(
			'/:id/operation-file',
			{ preHandler: authorizationMiddleware('plans', ['read']) },
			getOperationFile,
		);

		instance.get(
			'/:id/apex-file',
			{ preHandler: authorizationMiddleware('plans', ['read_apex_file']) },
			getApexFile,
		);

		instance.get(
			'/:id/operation-file/download',
			{ preHandler: authorizationMiddleware('plans', ['read']) },
			downloadOperationFile,
		);

		instance.get(
			'/:id/apex-file/download',
			{ preHandler: authorizationMiddleware('plans', ['read_apex_file']) },
			downloadApexFile,
		);

		instance.post(
			'/:id/apex-file',
			{ preHandler: authorizationMiddleware('plans', ['update_apex_file']) },
			updateApexFile,
		);

		instance.delete(
			'/:id/apex-file',
			{ preHandler: authorizationMiddleware('plans', ['delete_apex_file']) },
			deleteApexFile,
		);

		instance.get(
			'/:id/apex-file/send-notification',
			{ preHandler: authorizationMiddleware('plans', ['send_apex_notification']) },
			sendApexNotification,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware('plans', ['create']) },
			createPlan,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware('plans', ['update']) },
			updatePlan,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware('plans', ['lock']) },
			lockPlan,
		);

		instance.get(
			'/:id/controller-reprocess',
			{ preHandler: authorizationMiddleware('plans', ['update_controller']) },
			controllerReprocessPlan,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware('plans', ['delete']) },
			deletePlan,
		);

		instance.post(
			'/:id/change-gtfs',
			{ preHandler: authorizationMiddleware('plans', ['update_gtfs_plan']) },
			changeOperationFile,
		);

		instance.get('/drt-model/:id', getDrtModel);

		next();
	},
	{ prefix: NAMESPACE },
);
