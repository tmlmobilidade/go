/* * */

import { AlertsListFilterAgency } from '@/components/common/list/AlertsListFilterAgency';
import { AlertsListFilterCause } from '@/components/common/list/AlertsListFilterCause';
import { AlertsListFilterEffect } from '@/components/common/list/AlertsListFilterEffect';
import { AlertsListFilterMunicipality } from '@/components/common/list/AlertsListFilterMunicipality';
import { AlertsListFilterPublishStatus } from '@/components/common/list/AlertsListFilterPublishStatus';
import { AlertsListFilterReferenceType } from '@/components/common/list/AlertsListFilterReferenceType';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListFiltersBar() {
	return (
		<FiltersBar>
			<AlertsListFilterAgency />
			<AlertsListFilterReferenceType />
			<AlertsListFilterPublishStatus />
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
