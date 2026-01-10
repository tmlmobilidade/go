/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			{children}
		</AgenciesContextProvider>
	);
}
