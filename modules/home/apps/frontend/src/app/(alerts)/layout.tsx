/* * */

import { AlertsListContextProvider } from '@/contexts/AlertsList.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { StopsContextProvider } from '@/contexts/Stops.context';
import { AgenciesContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<LinesContextProvider>
			<StopsContextProvider>
				<AgenciesContextProvider>
					<AlertsListContextProvider>
						{children}
					</AlertsListContextProvider>
				</AgenciesContextProvider>
			</StopsContextProvider>
		</LinesContextProvider>
	);
}
