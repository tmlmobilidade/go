/* * */

import { RealtimeListFilterAgency } from '@/components/realtime/list/RealtimeListFilterAgency';
import { RealtimeListFilterCause } from '@/components/realtime/list/RealtimeListFilterCause';
import { RealtimeListFilterEffect } from '@/components/realtime/list/RealtimeListFilterEffect';
import { RealtimeListFilterMunicipality } from '@/components/realtime/list/RealtimeListFilterMunicipality';
import { RealtimeListFilterPublishStatus } from '@/components/realtime/list/RealtimeListFilterPublishStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListFiltersBar() {
	return (
		<FiltersBar>
			<RealtimeListFilterAgency />
			<RealtimeListFilterPublishStatus />
			<RealtimeListFilterCause />
			<RealtimeListFilterEffect />
			<RealtimeListFilterMunicipality />
		</FiltersBar>
	);
}
