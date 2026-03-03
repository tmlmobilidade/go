/* * */

import { ClickHouseColumn } from '@tmlmobilidade/clickhouse';

/* * */

export interface ShapeNode {
	latitude: number
	longitude: number
	node_index: number
	shape_id: string
}

export const shapeNodeTableSchema: ClickHouseColumn<ShapeNode>[] = [
	{ name: 'shape_id', type: 'String' },
	{ name: 'node_index', type: 'UInt32' },
	{ name: 'longitude', type: 'Float64' },
	{ name: 'latitude', type: 'Float64' },
];
