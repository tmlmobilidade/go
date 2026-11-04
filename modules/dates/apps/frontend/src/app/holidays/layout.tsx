/* * */

import { HolidaysList } from '@/components/holidays/list/HolidaysList';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="holidays"
			panes={[
				<HolidaysList key="list" />,
				children,
			]}
		/>
	);
}
