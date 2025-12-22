/* * */

import { ScheduledListFilterAgency } from '@/components/scheduled/list/ScheduledListFilterAgency';
import { ScheduledListFilterCause } from '@/components/scheduled/list/ScheduledListFilterCause';
import { ScheduledListFilterEffect } from '@/components/scheduled/list/ScheduledListFilterEffect';
import { ScheduledListFilterMunicipality } from '@/components/scheduled/list/ScheduledListFilterMunicipality';
import { ScheduledListFilterPublishStatus } from '@/components/scheduled/list/ScheduledListFilterPublishStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFiltersBar() {
	return (
		<FiltersBar>
			<ScheduledListFilterAgency />
			<ScheduledListFilterPublishStatus />
			<ScheduledListFilterCause />
			<ScheduledListFilterEffect />
			<ScheduledListFilterMunicipality />
			{/* <LineFilter /> */}
			{/* <StopFilter /> */}
			{/* <PublishDateFilter /> */}
			{/* <ValidityDateFilter /> */}
		</FiltersBar>
	);
}
