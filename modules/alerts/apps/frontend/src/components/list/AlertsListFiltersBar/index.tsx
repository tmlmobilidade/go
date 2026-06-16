/* * */

import { AlertsListFilterAgency } from '@/components/list/AlertsListFilterAgency';
import { AlertsListFilterCause } from '@/components/list/AlertsListFilterCause';
import { AlertsListFilterCreationDate } from '@/components/list/AlertsListFilterCreationDate';
import { AlertsListFilterDateRange } from '@/components/list/AlertsListFilterDateRange';
import { AlertsListFilterEffect } from '@/components/list/AlertsListFilterEffect';
import { AlertsListFilterMunicipality } from '@/components/list/AlertsListFilterMunicipality';
import { AlertsListFilterPublishStatus } from '@/components/list/AlertsListFilterPublishStatus';
import { AlertsListFilterReferenceType } from '@/components/list/AlertsListFilterReferenceType';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFiltersBar() {
	return (
		<FiltersBar>
			<AlertsListFilterAgency />
			<AlertsListFilterPublishStatus />
			<AlertsListFilterReferenceType />
			<AlertsListFilterCause />
			<AlertsListFilterEffect />
			<AlertsListFilterMunicipality />
			<AlertsListFilterDateRange />
			<AlertsListFilterCreationDate />
			{/* <LineFilter /> */}
			{/* <StopFilter /> */}
			{/* <PublishDateFilter /> */}
			{/* <ValidityDateFilter /> */}
		</FiltersBar>
	);
}
