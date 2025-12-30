/* * */

import { VehiclesDetails } from '@/components/Vehicles/detail/VehiclesDetails';
import { VehiclesDetailContextProvider } from '@/contexts/VehiclesDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<VehiclesDetailContextProvider vehicleId={id}>
			<VehiclesDetails />
		</VehiclesDetailContextProvider>
	);
}
