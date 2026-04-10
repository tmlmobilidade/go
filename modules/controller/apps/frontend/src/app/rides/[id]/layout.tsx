/* * */

import { RideAcceptanceContextProvider } from '@/contexts/RideAcceptance.context';
import { RideAnalysisContextProvider } from '@/contexts/RideAnalysis.context';
import { RideFavoritesContextProvider } from '@/contexts/RideFavorites.context';

/* * */

export default async function Layout({ children, params }) {
	const { id } = await params;
	return (
		<RideFavoritesContextProvider>
			<RideAnalysisContextProvider rideId={decodeURIComponent(id)}>
				<RideAcceptanceContextProvider rideId={decodeURIComponent(id)}>
					{children}
				</RideAcceptanceContextProvider>
			</RideAnalysisContextProvider>
		</RideFavoritesContextProvider>
	);
}
