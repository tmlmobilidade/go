import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { authorizationMiddleware, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { municipalities } from '@tmlmobilidade/interfaces';
import { type MunicipalityFeature, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/municipalities';

/* * */

const server = FastifyService.getInstance().server;

/* * */

interface MunicipalityJsonItem {
	_id: MunicipalityFeature['_id']
	geometry: number[][]
	properties: MunicipalityFeature['properties']
}

const getMunicipalityAggregationPipeline = () => {
	return [
		{
			$project: {
				_id: 1,
				geometry: {
					$switch: {
						branches: [
							{
								case: { $eq: ['$geometry.type', 'Polygon'] },
								then: { $ifNull: [{ $arrayElemAt: ['$geometry.coordinates', 0] }, []] },
							},
							{
								case: { $eq: ['$geometry.type', 'MultiPolygon'] },
								then: {
									$ifNull: [
										{ $arrayElemAt: [{ $arrayElemAt: ['$geometry.coordinates', 0] }, 0] },
										[],
									],
								},
							},
						],
						default: [],
					},
				},
				properties: 1,
			},
		},
		{ $sort: { _id: 1 } },
	] as unknown as Parameters<typeof municipalities.aggregate>[0];
};

const getMunicipalitiesAggregation = async (request: FastifyRequest, reply: FastifyReply<MunicipalityJsonItem[]>) => {
	const result = await municipalities.aggregate(getMunicipalityAggregationPipeline()) as unknown as MunicipalityJsonItem[];

	return reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
};

const downloadMunicipalitiesJson = async (request: FastifyRequest, reply: FastifyReply<string>) => {
	const features = await municipalities.aggregate(getMunicipalityAggregationPipeline()) as unknown as MunicipalityJsonItem[];
	const payload = { features, type: 'FeatureCollection' } as const;
	const body = JSON.stringify(payload);
	const bodyStream = new ReadableStream({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(body));
			controller.close();
		},
	});

	reply.header('Content-Disposition', 'attachment; filename="municipalities.json"');
	reply.header('Content-Type', 'application/json');

	return reply.send(bodyStream);
};

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.home.scope, [PermissionCatalog.all.home.actions.read_wiki]) },
			getMunicipalitiesAggregation,
		);

		instance.get(
			'/getAllMunicipalitiesJson/upload',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.home.scope, [PermissionCatalog.all.home.actions.read_wiki]) },
			downloadMunicipalitiesJson,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
