'use client';

import { PeriodAssignContent } from '@/components/year-periods/calendar/PeriodAssignContent';
import { PeriodAssignHeader } from '@/components/year-periods/calendar/PeriodAssignHeader';
import { PeriodsListContextProvider } from '@/components/year-periods/list/PeriodsList.context';
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
