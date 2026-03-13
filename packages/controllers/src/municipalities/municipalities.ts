/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { municipalities } from '@tmlmobilidade/interfaces';
import { type MunicipalityFeature } from '@tmlmobilidade/types';

/* * */

interface MunicipalityAggregationItem {
	_id: MunicipalityFeature['_id']
	geometry: number[][]
	properties: MunicipalityFeature['properties']
}

/* * */

export class MunicipalitiesSharedController {
	/**
	 * Returns municipalities with flattened geometry coordinates.
	 */
	static async getAggregation(request: FastifyRequest, reply: FastifyReply<MunicipalityAggregationItem[]>) {
		const aggregationPipeline = [
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

		const result = await municipalities.aggregate(aggregationPipeline) as unknown as MunicipalityAggregationItem[];

		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
	}
}
