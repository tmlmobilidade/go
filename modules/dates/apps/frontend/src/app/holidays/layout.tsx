/* * */

import { HolidaysList } from '@/components/holidays/list/HolidaysList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="holidays"
			panes={[
				<HolidaysList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
