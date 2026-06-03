'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { IconBus, IconBusOff, IconList } from '@tabler/icons-react';
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
	// B. Transform data

	const currentViewOptions = [
		{ label: t('default:stops.StopsListToolbar.by_current_view.map'), value: 'map' },
		{ label: t('default:stops.StopsListToolbar.by_current_view.list'), value: 'list' },
	];

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Section gap="md">
				<div className={styles.toolbar}>
					<SearchInput onChange={stopsListContext.filters.search.set} value={stopsListContext.filters.search.value} />
					<div className={styles.toggle} onClick={stopsListContext.view.toggleView}>
						<IconList size={20} />
					</div>
					<div className={styles.toggle} onClick={stopsListContext.view.toggleShowVehicles}>
						{stopsListContext.view.showVehicles ? <IconBus size={20} /> : <IconBusOff size={20} />}
					</div>
				</div>
			</Section>
		</div>
	);
}
