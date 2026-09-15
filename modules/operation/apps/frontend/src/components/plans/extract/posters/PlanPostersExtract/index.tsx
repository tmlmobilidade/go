'use client';

import { Pane } from '@tmlmobilidade/ui';

import { PlanPostersExtractBody } from '../PlanPostersExtractBody';
import { PlanPostersExtractHeader } from '../PlanPostersExtractHeader';

/* * */

export function PlanPostersExtract() {
	return (
		<Pane header={[<PlanPostersExtractHeader key="header" />]}>
			<PlanPostersExtractBody />
		</Pane>
	);
}
