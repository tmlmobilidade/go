'use client';

/* * */

import { VehiclesPositionsPage } from '@/components/positions/VehiclePositionPage';
import { VehiclePositionContextProvider } from '@/contexts/VehiclePosition.context';

/* * */

export default function Page() {
	return (
		<VehiclePositionContextProvider>
			<VehiclesPositionsPage />
		</VehiclePositionContextProvider>
	);
}
