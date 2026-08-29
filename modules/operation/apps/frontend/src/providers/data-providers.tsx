/* * */

import { VehiclePositionContextProvider } from '@/contexts/VehiclePosition.context';
import { AgenciesContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			<VehiclePositionContextProvider>
				{children}
			</VehiclePositionContextProvider>
		</AgenciesContextProvider>
	);
}
