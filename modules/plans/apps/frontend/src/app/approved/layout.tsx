/* * */

import { PlansList } from '@/components/plans/list/PlansList';
import { PlansListContextProvider } from '@/contexts/PlansList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="plans"
			panes={[
				<PlansListContextProvider>
					<PlansList />
				</PlansListContextProvider>,
				children,
			]}
		/>
	);
}
