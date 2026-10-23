'use client';

import { PeriodAssignContent } from '@/components/year-periods/calendar/PeriodAssignContent';
import { PeriodAssignHeader } from '@/components/year-periods/calendar/PeriodAssignHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function PeriodAssign() {
	return (
		<Pane header={[<PeriodAssignHeader key="period-assign-header" />]}>
			<PeriodAssignContent />
		</Pane>
	);
}
