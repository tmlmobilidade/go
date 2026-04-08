/* eslint-disable react/jsx-key */
/* * */

import { SamsDetailBasicInfos } from '@/components/sams/detail/SamsDetailBasicInfos';
import { SamsDetailCalender } from '@/components/sams/detail/SamsDetailCalender';
import { SamsDetailHeader } from '@/components/sams/detail/SamsDetailHeader';
import { SamsDetailList } from '@/components/sams/detail/SamsDetailList';
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
