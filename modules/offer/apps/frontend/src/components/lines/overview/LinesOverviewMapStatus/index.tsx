'use client';

import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function LinesOverviewMapStatus() {
	//

	//
	// A. Setup variables

	const linesOverviewContext = useLinesOverviewContext();

	//
	// B. Render components

	return (
		<div aria-live="polite" className={styles.widget} role="status">
			<Text c="#333333" size="sm" weight="semibold">
				{linesOverviewContext.data.patternsLoading ? 'A carregar patterns...' : `${linesOverviewContext.data.patternsData.length} patterns`}
			</Text>
		</div>
	);

	//
}
