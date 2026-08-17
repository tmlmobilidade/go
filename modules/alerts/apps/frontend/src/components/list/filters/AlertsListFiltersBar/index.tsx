/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { AlertsListFilterActivePeriod } from '../AlertsListFilterActivePeriod';
import { AlertsListFilterAgency } from '../AlertsListFilterAgency';
import { AlertsListFilterCause } from '../AlertsListFilterCause';
import { AlertsListFilterEffect } from '../AlertsListFilterEffect';
import { AlertsListFilterPublishDate } from '../AlertsListFilterPublishDate';
import { AlertsListFilterPublishStatus } from '../AlertsListFilterPublishStatus';
import { AlertsListFilterReferenceType } from '../AlertsListFilterReferenceType';

/* * */

export function AlertsListFiltersBar() {
	return (
		<FiltersBar>
			<AlertsListFilterAgency />
			<AlertsListFilterPublishDate />
			<AlertsListFilterActivePeriod />
			<AlertsListFilterPublishStatus />
			<AlertsListFilterReferenceType />
			<AlertsListFilterCause />
			<AlertsListFilterEffect />
		</FiltersBar>
	);
}
