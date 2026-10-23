/* * */

import { ZoneDetail } from '@/components/zones/detail/ZoneDetail';
import { ZonesDetailFormContextProvider } from '@/components/zones/detail/ZonesDetailForm.context';

/* * */

export default async function Page() {
	return (
		<ZonesDetailFormContextProvider>
			<ZoneDetail />
		</ZonesDetailFormContextProvider>
	);
}
