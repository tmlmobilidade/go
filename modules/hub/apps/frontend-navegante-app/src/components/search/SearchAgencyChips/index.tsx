'use client';

import { ScrollChips } from '@/components/common/lists/ScrollChips';
import { AGENCY_LOGO_MAP } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import { useFilterStateString } from '@tmlmobilidade/ui';
import clsx from 'clsx';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

const AGENCY_ORDER = ['4', '2', '16', '15', 'CM', '1', '8'] as const;

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
						aria-label={AGENCY_NAMES_MAP[agencyId as keyof typeof AGENCY_NAMES_MAP].short}
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
							src={AGENCY_LOGO_MAP[agencyId as keyof typeof AGENCY_LOGO_MAP]}
							width={40}
						/>
					</button>
				);
			})}
		</ScrollChips>
	);

	//
}
