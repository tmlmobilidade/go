'use client';
/* * */

import { AlertsPublicListFilterAgency } from '@/components/alerts/list/AlertsPublicListFilterAgency';
import { AlertsPublicListFilterCause } from '@/components/alerts/list/AlertsPublicListFilterCause';
import { AlertsPublicListFilterDates } from '@/components/alerts/list/AlertsPublicListFilterDates';
import { AlertsPublicListFilterEffect } from '@/components/alerts/list/AlertsPublicListFilterEffect';
import { AlertsPublicListFilterLine } from '@/components/alerts/list/AlertsPublicListFilterLine';
import { AlertsPublicListFilterPast } from '@/components/alerts/list/AlertsPublicListFilterPast';
import { AlertsPublicListFilterSearch } from '@/components/alerts/list/AlertsPublicListFilterSearch';
import { AlertsPublicListFilterStop } from '@/components/alerts/list/AlertsPublicListFilterStop';
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
