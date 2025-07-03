/* * */

import { PlanList } from '@/components/plans/list/PlansList';
import { PlanListContextProvider } from '@/contexts/PlanList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			panes={[
				<PlanListContextProvider>
					<PlanList />
				</PlanListContextProvider>,
				children,
			]}
		/>
	);
}
