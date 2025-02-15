/* * */

import { RidesDetailContextProvider } from '@/contexts/RidesDetail.context';

/* * */

export default async function Layout({ children, params }) {
	const { ride_id } = await params;
	return (
		<RidesDetailContextProvider rideId={ride_id}>
			{children}
		</RidesDetailContextProvider>
	);
}
