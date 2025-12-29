'use client';

/* * */

import { PeriodCreateBasicInfo } from '@/components/periods/create/PeriodCreateBasicInfo';
import { PeriodCreateHeader } from '@/components/periods/create/PeriodCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function PeriodCreate() {
	return (
		<Pane header={[<PeriodCreateHeader />]}>
			<PeriodCreateBasicInfo />
		</Pane>
	);
}
