/* * */

import { PeriodsList } from '@/components/year-periods/list/PeriodsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="periods"
			panes={[
				<PeriodsList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
