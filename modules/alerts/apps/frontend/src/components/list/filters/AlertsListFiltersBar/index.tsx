/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { AlertsListFilterAgency } from '../AlertsListFilterAgency';
import { AlertsListFilterCause } from '../AlertsListFilterCause';
import { AlertsListFilterEffect } from '../AlertsListFilterEffect';
import { AlertsListFilterPublishStatus } from '../AlertsListFilterPublishStatus';
import { AlertsListFilterReferenceType } from '../AlertsListFilterReferenceType';

/* * */

export function AlertsListFiltersBar() {
	return (
		<FiltersBar>
			<AlertsListFilterAgency />
			<AlertsListFilterPublishStatus />
			<AlertsListFilterReferenceType />
			<AlertsListFilterCause />
			<AlertsListFilterEffect />
		</FiltersBar>
	);
}
