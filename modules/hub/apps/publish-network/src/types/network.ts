/* * */

import { type HubV1ApiLine, type HubV1ApiPattern, type HubV1ApiRoute, type HubV1ApiStop, type HubV1GtfsRoutes } from '@tmlmobilidade/go-types-hub';

/* * */

export interface Network {
	lines: HubV1ApiLine[]
	patterns: HubV1ApiPattern[][]
	routes: HubV1ApiRoute[]
	stops: HubV1ApiStop[]
}

export interface NetworkContext {
	lines: Map<string, HubV1ApiLine>
	patterns: Map<string, Map<string, HubV1ApiPattern>>
	route_data: Map<string, HubV1GtfsRoutes>
	routes: Map<string, HubV1ApiRoute>
	stops: Map<string, HubV1ApiStop>
}
