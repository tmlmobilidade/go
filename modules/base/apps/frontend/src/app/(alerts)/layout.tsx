/* * */

import { AlertsPublicListContextProvider } from '@/contexts/AlertsPublicList.context';
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
					<AlertsPublicListContextProvider>
						{children}
					</AlertsPublicListContextProvider>
				</AgenciesContextProvider>
			</StopsContextProvider>
		</LinesContextProvider>
	);
}
