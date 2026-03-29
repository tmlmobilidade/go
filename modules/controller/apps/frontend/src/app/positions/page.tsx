'use client';

/* * */

import { VehiclesPositionsPage } from '@/components/positions/VehiclePositionPage';
import { VehiclePositionContextProvider } from '@/contexts/VehiclePosition.context';
import { MapContextProvider, MeContextProvider } from '@tmlmobilidade/ui';

/* * */

export default function Page() {
	return (
		<MeContextProvider> {/* ! Temporary | needs to be removed */}
			<MapContextProvider>
				<VehiclePositionContextProvider>
					<VehiclesPositionsPage />
				</VehiclePositionContextProvider>
			</MapContextProvider>
		</MeContextProvider>
	);
}
