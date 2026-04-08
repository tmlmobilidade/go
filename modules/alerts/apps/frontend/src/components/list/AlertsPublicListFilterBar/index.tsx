'use client';
/* * */

import { AlertsPublicListFilterCause } from '@/components/list/AlertsPublicListFilterCause';
import { AlertsPublicListFilterEffect } from '@/components/list/AlertsPublicListFilterEffect';
import { AlertsPublicListFilterLine } from '@/components/list/AlertsPublicListFilterLine';
import { AlertsPublicListFilterPast } from '@/components/list/AlertsPublicListFilterPast';
import { AlertsPublicListFilterSearch } from '@/components/list/AlertsPublicListFilterSearch';
import { AlertsPublicListFilterStop } from '@/components/list/AlertsPublicListFilterStop';
import { FiltersBar } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function AlertsPublicListFilterBar() {
	return (
		<div className={styles.sticky}>
			<FiltersBar>
				<AlertsPublicListFilterLine />
				<AlertsPublicListFilterStop />
				<AlertsPublicListFilterCause />
				<AlertsPublicListFilterEffect />
				<AlertsPublicListFilterPast />
				<AlertsPublicListFilterSearch />
			</FiltersBar>
		</div>
	);
}
