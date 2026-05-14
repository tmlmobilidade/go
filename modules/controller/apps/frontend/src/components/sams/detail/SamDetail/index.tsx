/* eslint-disable react/jsx-key */
'use client';

/* * */

import { SamsDetailBasicInfos } from '@/components/sams/detail/SamDetailBasicInfos';
import { SamsDetailCalendar } from '@/components/sams/detail/SamDetailCalendar';
import { SamsDetailHeader } from '@/components/sams/detail/SamDetailHeader';
import { SamsDetailList } from '@/components/sams/detail/SamDetailList';
import { Pane } from '@tmlmobilidade/ui';

export function SamsDetail() {
	return (
		<Pane header={[
			<SamsDetailHeader />,
		]}
		>
			<SamsDetailBasicInfos />
			<SamsDetailCalendar />
			<SamsDetailList />
		</Pane>
	);
}

/* * */
