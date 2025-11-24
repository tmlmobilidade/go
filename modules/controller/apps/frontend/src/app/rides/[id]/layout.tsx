/* * */

import { RideAcceptanceContextProvider } from '@/contexts/RideAcceptance.context';
import { RideAnalysisContextProvider } from '@/contexts/RideAnalysis.context';

/* * */

export default async function Layout({ children, params }) {
	const { id } = await params;
	return (
		<RideAnalysisContextProvider rideId={decodeURIComponent(id)}>
			<RideAcceptanceContextProvider rideId={decodeURIComponent(id)}>
				{children}
			</RideAcceptanceContextProvider>
		</RideAnalysisContextProvider>
	);
}
