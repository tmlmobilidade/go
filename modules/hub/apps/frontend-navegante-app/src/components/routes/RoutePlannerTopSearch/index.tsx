'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { IconHome, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerTopSearch() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<button
				className={styles.searchButton}
				onClick={routePlannerContext.actions.openFullInput}
				type="button"
			>
				<IconSearch className={styles.searchIcon} size={24} />
				<span className={styles.placeholder}>
					{routePlannerContext.data.destination?.label || t('default:routes.RoutePlannerTopSearch.placeholder')}
				</span>
				<IconHome className={styles.homeIcon} size={24} />
			</button>
		</div>
	);

	//
}
