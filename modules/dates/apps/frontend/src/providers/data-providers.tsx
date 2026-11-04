/* * */

import { MeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return <MeContextProvider>{children}</MeContextProvider>;
}
