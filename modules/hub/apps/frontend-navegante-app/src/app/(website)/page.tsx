'use client';
/* * */

import { HomePage } from '@/components/home/HomePage';
import { AlertsListContextProvider } from '@/contexts/AlertsList.context';
import { LinesListContextProvider } from '@/contexts/LinesList.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';
import { VehiclesListContextProvider } from '@/contexts/VehiclesList.context';

/* * */

export default function Page() {
	//

	//
	// B. Render Components

	return (
		<AlertsListContextProvider>
			<LinesListContextProvider>
				<StopsListContextProvider>
					<VehiclesListContextProvider>
						<HomePage />
					</VehiclesListContextProvider>
				</StopsListContextProvider>
			</LinesListContextProvider>
		</AlertsListContextProvider>
	);

	//
}
