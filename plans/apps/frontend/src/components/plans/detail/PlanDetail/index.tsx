'use client';

import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { Loader, Pane } from '@tmlmobilidade/ui';

import { PlanDetailHeader } from '../PlanDetailHeader';
import { PlanDetailSectionFiles } from '../PlanDetailSectionFiles';
import { PlanDetailSectionInfo } from '../PlanDetailSectionInfo';

/* * */

export function PlanDetail() {
	//

	//
	// A. Render components

	const { data, flags } = usePlanDetailContext();

	if (flags.isLoading || flags.error || !data.plan || !data.plan.gtfs_agency || !data.plan.gtfs_feed_info) {
		return <Loader />;
	}

	return (
		<Pane header={[<PlanDetailHeader />]}>
			<PlanDetailSectionInfo />
			<PlanDetailSectionFiles />
		</Pane>
	);
}
