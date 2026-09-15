'use client';

import { HolidaysCreateBasicInfo } from '@/components/holidays/create/HolidaysCreateBasicInfo';
import { HolidaysCreateHeader } from '@/components/holidays/create/HolidaysCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function HolidaysCreate() {
	return (
		<Pane header={[<HolidaysCreateHeader key="header" />]}>
			<HolidaysCreateBasicInfo />
		</Pane>
	);
}
