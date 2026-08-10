/* * */

import { LinesList } from '@/components/lines/list/LinesList';
import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { DataProviders } from '@/providers/data-providers';
import { MeContextProvider, PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<MeContextProvider>
			<DataProviders>
				<LinesListContextProvider>
					<PanesManager
						id="lines"
						panes={[
							<LinesList key="lines-list" />,
							children,
						]}
					/>
				</LinesListContextProvider>
			</DataProviders>
		</MeContextProvider>
	);
}
