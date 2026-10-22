'use client';

import { useMemo } from 'react';

import { TagGroup } from '../TagGroup';
import { type AgencyTagData, toAgencyTag } from './to-agency-tag';

export { type AgencyTagData, toAgencyTag } from './to-agency-tag';

/* * */

interface AgencyTagGroupProps {
	agencyIds: string[]
	data?: AgencyTagData[]
	limit?: number
}

/* * */

/** Standard compact operator display for table cells. */
export function AgencyTagGroup({ agencyIds, data = [], limit = 4 }: AgencyTagGroupProps) {
	//

	//
	// A. Transform data

	const agenciesById = useMemo(() => new Map(data.map(agency => [agency._id, agency])), [data]);
	const tags = useMemo(() => agencyIds.map(agencyId => toAgencyTag(agencyId, agenciesById.get(agencyId))), [agencyIds, agenciesById]);

	//
	// B. Render components

	return (
		<TagGroup limit={limit} tags={tags} />
	);
}
