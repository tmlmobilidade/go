'use client';

import { YearPeriodsCreateBasicInfo } from '@/components/year-periods/create/YearPeriodsCreateBasicInfo';
import { YearPeriodsCreateHeader } from '@/components/year-periods/create/YearPeriodsCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function YearPeriodsCreate() {
	return (
		<Pane header={[<YearPeriodsCreateHeader key="header" />]}>
			<YearPeriodsCreateBasicInfo />
		</Pane>
	);
}
