/* * */

import { LinesList } from '@/components/lines/list/LinesList';
import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { DataProviders } from '@/providers/data-providers';
import { MeContextProvider, PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="lines"
			panes={[
				<MeContextProvider>
					<DataProviders>
						<LinesListContextProvider>
							<LinesList />
						</LinesListContextProvider>
					</DataProviders>
				</MeContextProvider>,
				children,
			]}
		/>
	);
}
