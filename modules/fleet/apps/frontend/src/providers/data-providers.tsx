/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { MeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<MeContextProvider>
			<AgenciesContextProvider>
				{children}
			</AgenciesContextProvider>
		</MeContextProvider>
	);
}
