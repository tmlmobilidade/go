/* eslint-disable react/jsx-key */
'use client';

/* * */

import { SamsDetailBasicInfos } from '@/components/sams/detail/SamDetailBasicInfos';
import { SamsDetailCalender } from '@/components/sams/detail/SamDetailCalender';
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
			<SamsDetailCalender />
			<SamsDetailList />
		</Pane>
	);
}

/* * */
