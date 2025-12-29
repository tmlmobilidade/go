'use client';

/* * */

import { PeriodAssignContent } from '@/components/periods/calendar/PeriodAssignContent';
import { PeriodAssignHeader } from '@/components/periods/calendar/PeriodAssignHeader';
import { PeriodsListContextProvider } from '@/components/periods/list/PeriodsList.context';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function PeriodAssign() {
	return (
		<Pane header={[<PeriodAssignHeader />]}>
			<PeriodsListContextProvider>
				<PeriodAssignContent />
			</PeriodsListContextProvider>
		</Pane>
	);
}
