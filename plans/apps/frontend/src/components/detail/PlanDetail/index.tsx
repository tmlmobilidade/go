'use client';

import { Pane } from '@tmlmobilidade/ui';

import { PlanDetailHeader } from '../PlanDetailHeader';
import { PlanDetailSectionInfo } from '../PlanDetailSectionInfo';
/* * */

export function PlanDetail() {
	//

	//
	// A. Render components
	return (
		<Pane header={[<PlanDetailHeader />]}>
			<PlanDetailSectionInfo />
		</Pane>
	);
}
