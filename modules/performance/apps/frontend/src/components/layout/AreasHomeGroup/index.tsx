'use client';

/* * */

import { AreasHome } from '@/components/layout/AreasHome';
import { type AgencyType } from '@/constants';

import styles from './styles.module.css';

/* * */

interface AreasHomeGroupProps {
	agencies: AgencyType[]
}

/* * */

export function AreasHomeGroup({ agencies }: AreasHomeGroupProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{agencies.map(agency => (
				<AreasHome key={agency} agency={agency} />
			))}
		</div>
	);

	//
}
