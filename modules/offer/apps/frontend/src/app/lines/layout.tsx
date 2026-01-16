/* * */

import { LinesList } from '@/components/lines/list/LinesList';
import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { MeContextProvider, PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="lines"
			panes={[
				<MeContextProvider>
					<PeriodsContextProvider>
						<LinesListContextProvider>
							<LinesList />
						</LinesListContextProvider>
					</PeriodsContextProvider>
				</MeContextProvider>,
				children,
			]}
		/>
	);
}
