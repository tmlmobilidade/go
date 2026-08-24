/* * */

import { PlansList } from '@/components/plans/list/PlansList';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="plans"
			panes={[
				<PlansList key="list" />,
				children,
			]}
		/>
	);
}
