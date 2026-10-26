/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';

import { type TagProps } from '../Tag';

/* * */

export type AgencyTagData = Partial<Pick<Agency, 'code' | 'short_name'>> & Pick<Agency, '_id' | 'name'>;

/** Compact agency label with enough detail to identify it on hover. */
export function toAgencyTag(agencyId: string, agency?: AgencyTagData): TagProps {
	return {
		label: agency?.short_name || agency?.code || agency?.name || agencyId,
		tooltip: agency?.name ? `${agency.name} [${agencyId}]` : agencyId,
		variant: 'muted',
	};
}
