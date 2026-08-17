/* * */

import { AlertsListFilterAgency } from '@/components/list/AlertsListFilterAgency';
import { AlertsListFilterCause } from '@/components/list/AlertsListFilterCause';
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
			{/* <LineFilter /> */}
			{/* <StopFilter /> */}
			{/* <PublishDateFilter /> */}
			{/* <ValidityDateFilter /> */}
		</FiltersBar>
	);
}
