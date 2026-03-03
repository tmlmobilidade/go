/* * */

import { ClickHouseColumn } from '@tmlmobilidade/clickhouse';

/* * */

export interface StopNode {
	id: string
	latitude: number
	longitude: number
}

export const stopTableSchema: ClickHouseColumn<StopNode>[] = [
	{ name: 'id', type: 'String' },
	{ name: 'longitude', type: 'Float64' },
	{ name: 'latitude', type: 'Float64' },
];
