import { type BaseMapOperatorId } from '@/types/map';

/* * */

export const BASE_MAP_OPERATOR_IDS = ['4', '2', '16', '15', 'CM', '1', '8', '3', '21'] as const satisfies readonly BaseMapOperatorId[];

/* * */

export function getBaseMapOperatorId(agencyId: string): BaseMapOperatorId | null {
	if (['41', '42', '43', '44'].includes(agencyId)) return 'CM';
	if (BASE_MAP_OPERATOR_IDS.includes(agencyId as BaseMapOperatorId)) return agencyId as BaseMapOperatorId;

	return null;
}

export function isBaseMapAgencyVisible(agencyId: string, excludedOperatorIds: BaseMapOperatorId[]): boolean {
	const operatorId = getBaseMapOperatorId(agencyId);
	if (!operatorId) return true;

	return !excludedOperatorIds.includes(operatorId);
}
