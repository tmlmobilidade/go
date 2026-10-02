import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { type HubV1ApiAlert, type HubV1ApiLine, type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

export type SearchResult = { entity: HubV1ApiAlert, id: string, label: string, score: number, type: 'alert' } | { entity: HubV1ApiLine, id: string, label: string, score: number, type: 'line' } | { entity: HubV1ApiStop, id: string, label: string, score: number, type: 'stop' } | { entity: RoutePlannerLocation, id: string, label: string, score: number, type: 'poi' };

export interface SearchGroup {
	key: SearchResult['type']
	results: SearchResult[]
}
