'use client';

/* * */

import { useDemoDataContext } from '@/contexts/DemoData.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { DEMO_PERIOD_SELECTION } from '@/data/demo-performance';
import { IconFlask } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function DemoDataControl() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const demoDataContext = useDemoDataContext();
	const filtersContext = usePerformanceFiltersContext();

	//
	// B. Handle actions

	const handleClick = () => {
		if (!demoDataContext.flags.is_enabled) {
			filtersContext.actions.setPeriod(DEMO_PERIOD_SELECTION);
		}
		demoDataContext.actions.toggle();
	};

	//
	// C. Render components

	if (filtersContext.data.screen === 'pulse') return null;

	return (
		<button
			aria-pressed={demoDataContext.flags.is_enabled}
			className={styles.root}
			data-active={demoDataContext.flags.is_enabled}
			onClick={handleClick}
			type="button"
		>
			<IconFlask aria-hidden="true" size={18} />
			<span>{t(demoDataContext.flags.is_enabled ? 'demoData.disable' : 'demoData.enable')}</span>
		</button>
	);

	//
}
