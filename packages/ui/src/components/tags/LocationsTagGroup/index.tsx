'use client';

import { IconMapPin } from '@tabler/icons-react';
import { type LocationGroupsOption, type LocationItem, summarizeLocations } from '@tmlmobilidade/go-types-locations';

import styles from './styles.module.css';

import { Tooltip } from '../../common/Tooltip';
import { TagGroup } from '../TagGroup';

/* * */

export interface LocationsTagGroupProps {
	groups?: LocationGroupsOption
	limit?: number
	locations: LocationItem[]
}

/* * */

/** Uses the picker's group definitions for a consistent compact location display. */
export function LocationsTagGroup({ groups = false, limit = 2, locations }: LocationsTagGroupProps) {
	//

	//
	// A. Transform data

	const summaries = summarizeLocations(locations, groups);
	if (!summaries.length) return null;
	const tags = summaries.map(summary => ({ icon: <IconMapPin size={16} aria-hidden />, label: summary.label, variant: 'muted' as const }));

	//
	// B. Render components

	return (
		<Tooltip label={locations.map(location => location.name).join(', ')} multiline withArrow>
			<div className={styles.container}><TagGroup limit={limit} tags={tags} /></div>
		</Tooltip>
	);
}
