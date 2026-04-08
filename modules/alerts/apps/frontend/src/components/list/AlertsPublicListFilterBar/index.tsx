'use client';
/* * */

import { FiltersBar } from '@tmlmobilidade/ui';
import styles from './styles.module.css';

import { AlertsPublicListFilterCause } from '../AlertsPublicListFilterCause';
import { AlertsPublicListFilterDates } from '../AlertsPublicListFilterDates';
import { AlertsPublicListFilterEffect } from '../AlertsPublicListFilterEffect';
import { AlertsPublicListFilterMunicipality } from '../AlertsPublicListFilterMunicipality';
import { AlertsPublicListFilterReferenceType } from '../AlertsPublicListFilterReferenceType';

/* * */

export function AlertsPublicListFilterBar() {
	//

	//
	// A. Setup Variables

	//
	// B. Render Components

	return (
		<div className={styles.sticky}>
			<FiltersBar>
				<AlertsPublicListFilterDates />
				<AlertsPublicListFilterReferenceType />
				<AlertsPublicListFilterCause />
				<AlertsPublicListFilterEffect />
				<AlertsPublicListFilterMunicipality />
			</FiltersBar>
		</div>
	);

	//
}
