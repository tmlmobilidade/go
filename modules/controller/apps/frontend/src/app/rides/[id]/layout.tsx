/* * */

import { RidesDetailContextProvider } from '@/contexts/RidesDetail.context';
import { RidesDetailAcceptanceContextProvider } from '@/contexts/RidesDetailAcceptance.context';

/* * */

export default async function Layout({ children, params }) {
	const { ride_id } = await params;
	return (
		<RidesDetailContextProvider rideId={decodeURIComponent(ride_id)}>
			<RidesDetailAcceptanceContextProvider rideId={decodeURIComponent(ride_id)}>
				{children}
			</RidesDetailAcceptanceContextProvider>
		</RidesDetailContextProvider>
	);
}
