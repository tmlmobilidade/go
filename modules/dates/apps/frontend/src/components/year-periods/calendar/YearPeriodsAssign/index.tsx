'use client';

import { YearPeriodsAssignContent } from '@/components/year-periods/calendar/YearPeriodsAssignContent';
import { YearPeriodsAssignHeader } from '@/components/year-periods/calendar/YearPeriodsAssignHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function YearPeriodsAssign() {
	return (
		<Pane header={[<YearPeriodsAssignHeader key="header" />]}>
			<YearPeriodsAssignContent />
		</Pane>
	);
}
