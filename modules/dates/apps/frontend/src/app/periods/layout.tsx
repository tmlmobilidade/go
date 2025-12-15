/* * */

import { PeriodsList } from '@/components/periods/list/PeriodsList';
import { PeriodsListContextProvider } from '@/contexts/PeriodsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="periods"
			panes={[
				<PeriodsListContextProvider>
					<PeriodsList />
				</PeriodsListContextProvider>,
				children,
			]}
		/>
	);
}
