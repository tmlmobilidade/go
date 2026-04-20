'use client';
/* * */

import { AlertsPublicListFilterAgency } from '@/components/modules/alerts/list/AlertsPublicListFilterAgency';
import { AlertsPublicListFilterCause } from '@/components/modules/alerts/list/AlertsPublicListFilterCause';
import { AlertsPublicListFilterDates } from '@/components/modules/alerts/list/AlertsPublicListFilterDates';
import { AlertsPublicListFilterEffect } from '@/components/modules/alerts/list/AlertsPublicListFilterEffect';
import { AlertsPublicListFilterLine } from '@/components/modules/alerts/list/AlertsPublicListFilterLine';
import { AlertsPublicListFilterPast } from '@/components/modules/alerts/list/AlertsPublicListFilterPast';
import { AlertsPublicListFilterSearch } from '@/components/modules/alerts/list/AlertsPublicListFilterSearch';
import { AlertsPublicListFilterStop } from '@/components/modules/alerts/list/AlertsPublicListFilterStop';
import { FiltersBar } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function AlertsPublicListFilterBar() {
	//

	//
	// A. Render Components
	return (
		<div className={styles.stickyFilterBar}>
			<FiltersBar>
				<AlertsPublicListFilterDates />
				<AlertsPublicListFilterAgency />
				<AlertsPublicListFilterLine />
				<AlertsPublicListFilterStop />
				<AlertsPublicListFilterCause />
				<AlertsPublicListFilterEffect />
				<AlertsPublicListFilterPast />
				<AlertsPublicListFilterSearch />
			</FiltersBar>
		</div>
	);

	//
}
