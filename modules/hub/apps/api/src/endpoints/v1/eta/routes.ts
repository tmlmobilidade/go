/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getEtaAllHandler } from './handlers/get-eta-all.js';
import { getEtaByStopIdHandler } from './handlers/get-eta-by-stop-id.js';
import { getEtaByTripIdHandler } from './handlers/get-eta-by-trip-id.js';
import { getEtaGtfsRtJsonHandler } from './handlers/get-eta-gtfs-rt-json.js';
import { getEtaGtfsRtProtobufHandler } from './handlers/get-eta-gtfs-rt-protobuf.js';

/* * */

const NAMESPACE = '/v1/eta';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', getEtaAllHandler);

		instance.get('/gtfs', getEtaGtfsRtJsonHandler);

		instance.get('/gtfs.pb', getEtaGtfsRtProtobufHandler);

		instance.get('/by-trip/:id', getEtaByTripIdHandler);

		instance.get('/by-stop/:id', getEtaByStopIdHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
