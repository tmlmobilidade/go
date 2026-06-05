/* * */

import { VehiclePositionContextProvider } from '@/contexts/VehiclePosition.context';
import { AgenciesContextProvider, AppProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<AgenciesContextProvider>
				<VehiclePositionContextProvider>
					{children}
				</VehiclePositionContextProvider>
			</AgenciesContextProvider>
		</AppProvider>
	);
}
