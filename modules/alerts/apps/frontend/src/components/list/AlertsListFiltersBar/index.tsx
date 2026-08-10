/* * */

import { AlertsListFilterActivePeriod } from '@/components/list/AlertsListFilterActivePeriod';
import { AlertsListFilterAgency } from '@/components/list/AlertsListFilterAgency';
import { AlertsListFilterCause } from '@/components/list/AlertsListFilterCause';
import { AlertsListFilterCreatedAt } from '@/components/list/AlertsListFilterCreatedAt';
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
			<AlertsListFilterActivePeriod />
			<AlertsListFilterCreatedAt />
			{/* <LineFilter /> */}
			{/* <StopFilter /> */}
			{/* <PublishDateFilter /> */}
			{/* <ValidityDateFilter /> */}
		</FiltersBar>
	);
}
