import { getAgencyDisplayInfo, getAgencyMapOperatorId } from '@/lib/agency-catalog';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';

/* * */

export interface OperatorLineGroup {
	agencyId: string
	lines: HubV1ApiLine[]
}

/* * */

export function groupLinesByOperator(lines: HubV1ApiLine[]): OperatorLineGroup[] {
	const groups = new Map<string, HubV1ApiLine[]>();

	for (const line of lines) {
		const agencyId = getAgencyMapOperatorId(line.agency_id) ?? line.agency_id;
		if (!agencyId) continue;
		const group = groups.get(agencyId) ?? [];
		group.push(line);
		groups.set(agencyId, group);
	}

	return [...groups.entries()]
		.map(([agencyId, groupLines]) => ({
			agencyId,
			lines: groupLines.sort((a, b) => a.short_name.localeCompare(b.short_name, undefined, { numeric: true })),
		}))
		.sort((a, b) => {
			const aName = getAgencyDisplayInfo(a.agencyId)?.fullName ?? a.agencyId;
			const bName = getAgencyDisplayInfo(b.agencyId)?.fullName ?? b.agencyId;
			return aName.localeCompare(bName, 'pt') || a.agencyId.localeCompare(b.agencyId);
		});
}
