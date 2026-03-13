/* * */

import { municipalities } from '@tmlmobilidade/interfaces';
import { type MunicipalityFeature } from '@tmlmobilidade/types';

/* * */

interface MunicipalityJsonItem {
	_id: MunicipalityFeature['_id']
	geometry: number[][]
	properties: MunicipalityFeature['properties']
}

interface MunicipalitiesJson {
	features: MunicipalityJsonItem[]
	type: 'FeatureCollection'
}

/* * */

export async function getMunicipalitiesJson(): Promise<MunicipalitiesJson> {
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

	const features = await municipalities.aggregate(aggregationPipeline) as unknown as MunicipalityJsonItem[];

	return {
		features,
		type: 'FeatureCollection',
	};
}
