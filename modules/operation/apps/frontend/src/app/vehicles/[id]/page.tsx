/* * */

import { VehiclesDetail } from '@/components/vehicles/detail/VehiclesDetail';
import { VehiclesDetailFormContextProvider } from '@/components/vehicles/detail/VehiclesDetailForm.context';

/* * */

export default async function Page() {
	return (
		<VehiclesDetailFormContextProvider>
			<VehiclesDetail />
		</VehiclesDetailFormContextProvider>
	);
}
