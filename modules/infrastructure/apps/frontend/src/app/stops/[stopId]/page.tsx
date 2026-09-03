/* * */

import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { StopsDetailFormContextProvider } from '@/components/stops/detail/StopsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<StopsDetailFormContextProvider>
			<StopsDetail />
		</StopsDetailFormContextProvider>
	);
}
