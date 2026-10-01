'use client';

import { LinesOverviewMap } from '@/components/lines/overview/LinesOverviewMap';
import { Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function LinesOverview() {
	//

	//
	// A. Render components

	return (
		<Surface className={styles.container} height="full">
			<LinesOverviewMap />
		</Surface>
	);

	//
}
