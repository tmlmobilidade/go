'use client';

import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LinesOverviewMapStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesOverviewContext = useLinesOverviewContext();

	//
	// B. Render components

	return (
		<div aria-live="polite" className={styles.widget} role="status">
			<Text c="#333333" size="sm" weight="semibold">
				{linesOverviewContext.data.patternsLoading ? t('lines:overview.LinesOverviewMapStatus.loading') : t('lines:overview.LinesOverviewMapStatus.count', { count: linesOverviewContext.data.patternsData.length })}
			</Text>
		</div>
	);

	//
}
