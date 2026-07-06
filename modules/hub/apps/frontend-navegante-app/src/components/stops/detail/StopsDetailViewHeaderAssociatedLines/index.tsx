'use client';

import { ScrollChips } from '@/components/common/lists/ScrollChips';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { getAgencyLogo } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewHeaderAssociatedLines() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Transform data

	const linesByAgencyId = useMemo(() => {
		// Group lines by agency ID
		const groups: Record<string, { agency_id: string, lines: HubLine[] }> = {};
		stopsDetailContext.data.associated_lines?.forEach((line) => {
			// Merge CM agencies into a single agency
			const agencyId = ['41', '42', '43', '44'].includes(line.agency_id) ? 'CM' : line.agency_id;
			// Initialize the array for the agency ID if it doesn't exist
			if (!groups[agencyId]) groups[agencyId] = { agency_id: agencyId, lines: [] };
			// Add the line to the array for the agency ID
			groups[agencyId].lines.push(line);
		});
		// Return an array of groups with their lines sorted by short_name
		// and each group sorted by the number of lines in ascending order
		return Object
			.values(groups)
			.map(group => ({ ...group, lines: group.lines.sort((a, b) => a.short_name.localeCompare(b.short_name, undefined, { numeric: true })) }))
			.sort((a, b) => a.lines.length - b.lines.length);
	}, [stopsDetailContext.data.associated_lines]);

	//
	// B. Render componentss

	return linesByAgencyId.map(group => (
		<ScrollChips key={group.agency_id}>
			<div className={styles.row}>
				<Image
					alt={t(`default:lines.LinesListGroup.logo.alt`, '', { agency_name: AGENCY_NAMES_MAP[group.agency_id].full })}
					height={60}
					src={getAgencyLogo(group.agency_id, '120x120', 'light')}
					width={60}
				/>
				{group.lines.map(line => (
					<LineBadge key={line._id} lineData={line} />
				))}
			</div>
		</ScrollChips>
	));
}
