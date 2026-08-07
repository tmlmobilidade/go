'use client';

import { ScrollChips } from '@/components/common/lists/ScrollChips';
import { getAgencyLogo } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import { useFilterStateString } from '@tmlmobilidade/ui';
import clsx from 'clsx';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

const AGENCY_ORDER = ['LTP61', 'IA2N9', 'KB1F6', '7NTB1', 'CM', 'IA9T6', 'A3H3M'] as const;

/* * */

export function SearchAgencyChips() {
	//

	//
	// A. Setup variables

	const filterAgency = useFilterStateString('agency');

	//
	// B. Render components

	return (
		<ScrollChips>
			{AGENCY_ORDER.map((agencyId) => {
				const isChecked = filterAgency.value === agencyId;
				return (
					<button
						key={agencyId}
						aria-label={AGENCY_NAMES_MAP[agencyId]?.short}
						aria-pressed={isChecked}
						onClick={() => filterAgency.set(isChecked ? '' : agencyId)}
						type="button"
						className={clsx(styles.agencyChip, {
							[styles.agencyChipSelected]: isChecked,
						})}
					>
						<Image
							alt=""
							height={27}
							src={getAgencyLogo(agencyId, '180x120', 'light')}
							width={40}
						/>
					</button>
				);
			})}
		</ScrollChips>
	);

	//
}
