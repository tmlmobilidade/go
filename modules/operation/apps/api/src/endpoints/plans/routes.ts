/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { changeOperationGtfsHandler } from './handlers/change-operation-gtfs.js';
import { controllerReprocessPlanHandler } from './handlers/controller-reprocess-plan.js';
import { deleteApexConfigHandler } from './handlers/delete-apex-config.js';
import { deletePlanHandler } from './handlers/delete-plan.js';
import { downloadApexConfigHandler } from './handlers/download-apex-config.js';
import { downloadOperationGtfsNormalizedHandler } from './handlers/download-operation-gtfs-normalized.js';
import { downloadOperationGtfsHandler } from './handlers/download-operation-gtfs.js';
import { getApexConfigHandler } from './handlers/get-apex-config.js';
import { getOperationGtfsNormalizedHandler } from './handlers/get-operation-gtfs-normalized.js';
import { getOperationGtfsHandler } from './handlers/get-operation-gtfs.js';
import { getPlanHandler } from './handlers/get-plan.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listPlansHandler } from './handlers/list-plans.js';
import { lockPlanHandler } from './handlers/lock-plan.js';
import { sendApexNotificationHandler } from './handlers/send-apex-notification.js';
import { updateApexConfigHandler } from './handlers/update-apex-config.js';
import { updatePlanHandler } from './handlers/update-plan.js';

/* * */

const NAMESPACE = '/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			listPlansHandler,
		);

		instance.get(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			listAgenciesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getPlanHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update]) },
			updatePlanHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.lock]) },
			lockPlanHandler,
		);

		instance.get(
			'/:id/controller-reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_controller]) },
			controllerReprocessPlanHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.delete]) },
			deletePlanHandler,
		);

		instance.post(
			'/:id/change-gtfs',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_gtfs_plan]) },
			changeOperationGtfsHandler,
		);

		//
		// APEX Config

		instance.post(
			'/:id/apex-config',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_apex_file]) },
			updateApexConfigHandler,
		);

		instance.get(
			'/:id/apex-config',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read_apex_file]) },
			getApexConfigHandler,
		);

		instance.get(
			'/:id/apex-config/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read_apex_file]) },
			downloadApexConfigHandler,
		);

		instance.get(
			'/:id/apex-config/send-notification',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.send_apex_notification]) },
			sendApexNotificationHandler,
		);

		instance.delete(
			'/:id/apex-config',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.delete_apex_file]) },
			deleteApexConfigHandler,
		);

		//
		// Operation GTFS

		instance.get(
			'/:id/operation-gtfs',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getOperationGtfsHandler,
		);

		instance.get(
			'/:id/operation-gtfs/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			downloadOperationGtfsHandler,
		);

		//
		// Operation GTFS Normalized

		instance.get(
			'/:id/operation-gtfs-normalized',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getOperationGtfsNormalizedHandler,
		);

		instance.get(
			'/:id/operation-gtfs-normalized/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			downloadOperationGtfsNormalizedHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
