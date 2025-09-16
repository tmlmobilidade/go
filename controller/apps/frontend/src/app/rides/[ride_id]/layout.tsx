/* * */

import { RidesDetailContextProvider } from '@/contexts/RidesDetail.context';
import { RidesDetailJustificationContextProvider } from '@/contexts/RidesDetailJustification.context';

/* * */

export default async function Layout({ children, params }) {
	const { ride_id } = await params;
	return (
		<RidesDetailContextProvider rideId={decodeURIComponent(ride_id)}>
			<RidesDetailJustificationContextProvider rideId={decodeURIComponent(ride_id)}>
				{children}
			</RidesDetailJustificationContextProvider>
		</RidesDetailContextProvider>
	);
}
