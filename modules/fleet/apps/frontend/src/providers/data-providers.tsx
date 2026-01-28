/* * */

import { AgenciesContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			{children}
		</AgenciesContextProvider>
	);
}
