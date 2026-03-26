/* * */

import { RideAcceptanceContextProvider } from '@/contexts/RideAcceptance.context';
import { RideAnalysisContextProvider } from '@/contexts/RideAnalysis.context';
import { RidePinsContextProvider } from '@/contexts/RidePins.context';

/* * */

export default async function Layout({ children, params }) {
	const { id } = await params;
	return (
		<RidePinsContextProvider>
			<RideAnalysisContextProvider rideId={decodeURIComponent(id)}>
				<RideAcceptanceContextProvider rideId={decodeURIComponent(id)}>
					{children}
				</RideAcceptanceContextProvider>
			</RideAnalysisContextProvider>
		</RidePinsContextProvider>
	);
}
