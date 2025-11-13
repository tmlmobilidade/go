/* * */

import { RideAcceptanceContextProvider } from '@/contexts/RideAcceptance.context';
import { RideAnalysisContextProvider } from '@/contexts/RideAnalysis.context';

/* * */

export default async function Layout({ children, params }) {
	const { ride_id } = await params;
	return (
		<RideAnalysisContextProvider rideId={decodeURIComponent(ride_id)}>
			<RideAcceptanceContextProvider rideId={decodeURIComponent(ride_id)}>
				{children}
			</RideAcceptanceContextProvider>
		</RideAnalysisContextProvider>
	);
}
