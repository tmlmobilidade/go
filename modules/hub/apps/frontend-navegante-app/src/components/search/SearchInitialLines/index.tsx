'use client';

import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { getAgencyDisplayInfo, getAgencyLogo } from '@/lib/agency-catalog';
import { groupLinesByOperator } from '@/utils/search/group-lines-by-operator';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import Image from 'next/image';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchInitialLinesProps {
	lines: HubV1ApiLine[]
	onSelect: (lineId: string) => void
	variant: 'sheet' | 'top'
}

const INITIAL_LINES_PER_OPERATOR = 5;
const ADDITIONAL_LINES_PER_CLICK = 30;

/* * */

export function SearchInitialLines({ lines, onSelect, variant }: SearchInitialLinesProps) {
	const { t } = useTranslation();
	const headingPrefix = useId();
	const groups = useMemo(() => groupLinesByOperator(lines), [lines]);
	const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

	return groups.map((group) => {
		const agency = getAgencyDisplayInfo(group.agencyId);
		const logo = getAgencyLogo(group.agencyId, '180x120', 'light');
		const visibleCount = visibleCounts[group.agencyId] ?? INITIAL_LINES_PER_OPERATOR;
		const headingId = `${headingPrefix}-${group.agencyId}`;
		const agencyName = agency?.fullName ?? group.agencyId;

		return (
			<section key={group.agencyId} aria-labelledby={headingId} className={styles.group} data-variant={variant}>
				<h2 id={headingId}>
					{logo && <Image alt="" className={styles.logo} height={40} src={logo} width={60} />}
					<span className={logo ? styles.visuallyHidden : undefined}>{agencyName}</span>
				</h2>
				<ul>
					{group.lines.slice(0, visibleCount).map(line => (
						<li key={line._id}>
							<RegularListItem onClick={() => onSelect(line._id)}>
								<LineDisplay lineData={line} />
							</RegularListItem>
						</li>
					))}
				</ul>
				{visibleCount < group.lines.length && (
					<button
						className={styles.showMore}
						onClick={() => setVisibleCounts(previous => ({ ...previous, [group.agencyId]: visibleCount + ADDITIONAL_LINES_PER_CLICK }))}
						type="button"
					>
						{t('default:search.Search.show_more_lines', '', { agency_name: agencyName })}
					</button>
				)}
			</section>
		);
	});
}
