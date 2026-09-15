/* * */

import { YearPeriodsList } from '@/components/year-periods/list/YearPeriodsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="periods"
			panes={[
				<YearPeriodsList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
