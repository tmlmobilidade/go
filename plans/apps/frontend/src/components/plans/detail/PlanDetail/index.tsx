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

	const { flags } = usePlanDetailContext();

	if (flags.loading) {
		return <Loader />;
	}

	return (
		<Pane header={[<PlanDetailHeader />]}>
			<PlanDetailSectionInfo />
			<PlanDetailSectionFiles />
		</Pane>
	);
}
