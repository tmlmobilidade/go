'use client';

/* * */

import { HolidayCreateBasicInfo } from '@/components/holidays/create/HolidayCreateBasicInfo';
import { HolidayCreateHeader } from '@/components/holidays/create/HolidayCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function HolidayCreate() {
	return (
		<Pane header={[<HolidayCreateHeader />]}>
			<HolidayCreateBasicInfo />
		</Pane>
	);
}
