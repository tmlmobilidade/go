'use client';
/* * */

import { AlertsPublicListFilterAgency } from '@/components/list/AlertsPublicListFilterAgency';
import { AlertsPublicListFilterCause } from '@/components/list/AlertsPublicListFilterCause';
import { AlertsPublicListFilterDates } from '@/components/list/AlertsPublicListFilterDates';
import { AlertsPublicListFilterEffect } from '@/components/list/AlertsPublicListFilterEffect';
import { AlertsPublicListFilterLine } from '@/components/list/AlertsPublicListFilterLine';
import { AlertsPublicListFilterPast } from '@/components/list/AlertsPublicListFilterPast';
import { AlertsPublicListFilterSearch } from '@/components/list/AlertsPublicListFilterSearch';
import { AlertsPublicListFilterStop } from '@/components/list/AlertsPublicListFilterStop';
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
