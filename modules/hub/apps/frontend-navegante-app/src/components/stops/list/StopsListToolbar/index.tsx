'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { IconList } from '@tabler/icons-react';
import { SearchInput, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsListToolbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsListContext = useStopsListContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<Section gap="md">
				<div className={styles.toolbar}>
					<SearchInput onChange={stopsListContext.filters.search.set} value={stopsListContext.filters.search.value} />
					<div
						aria-label={t('default:stops.StopsListToolbar.by_current_view.map')}
						className={styles.toggle}
						onClick={stopsListContext.view.toggleView}
					>
						<IconList size={20} />
					</div>
				</div>
			</Section>
		</div>
	);
}
